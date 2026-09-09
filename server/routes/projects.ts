import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Project } from '../models/Project.js';

const router = Router();

function dbReady(): { ok: boolean; reason?: string } {
  try {
    const state = mongoose.connection.readyState;
    if (state === 1) return { ok: true };
    if (!process.env.MONGODB_URI) {
      return { ok: false, reason: 'MONGODB_URI non configurata nelle variabili d’ambiente.' };
    }
    const STATES: Record<number, string> = {
      0: 'disconnesso',
      2: 'in connessione',
      3: 'disconnessione in corso',
    };
    return { ok: false, reason: `MongoDB non disponibile (stato: ${STATES[state] ?? state}).` };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : 'Errore database sconosciuto.' };
  }
}

function dbError(res: Response, reason: string) {
  res.status(503).json({
    ok: false,
    error: {
      code: 'DATABASE_UNAVAILABLE',
      message: reason,
      hint: 'Salvataggio continuerà comunque nel browser. Configura MONGODB_URI per abilitare la persistenza server.',
    },
  });
}

function toProjectPayload(p: any) {
  const out: any = { ...p };
  delete out._id;
  delete out.__v;
  delete out.createdAt;
  delete out.updatedAt;
  return out;
}

const defaultSort = { createdAt: -1 } as any;

// GET all projects
router.get('/', async (req: Request, res: Response) => {
  const db = dbReady();
  if (!db.ok) {
    return res.status(503).json({
      ok: false,
      error: {
        code: 'DATABASE_UNAVAILABLE',
        message: db.reason,
        hint: 'Il frontend userà i progetti di fallback dal file src/data.ts o dal localStorage.',
      },
    });
  }
  try {
    const projects = await Project.find().sort(defaultSort).lean();
    res.json(projects.map(toProjectPayload));
  } catch (error: any) {
    res.status(500).json({
      ok: false,
      error: {
        code: 'FETCH_FAILED',
        message: error?.message || 'Failed to fetch projects',
      },
    });
  }
});

// GET single project
router.get('/:id', async (req: Request, res: Response) => {
  const db = dbReady();
  if (!db.ok) return dbError(res, db.reason!);
  try {
    const { id } = req.params;
    const project = await Project.findOne({ $or: [{ _id: id }, { id }] }).lean();
    if (!project) {
      return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
    }
    res.json(toProjectPayload(project));
  } catch (error: any) {
    res.status(400).json({ ok: false, error: { code: 'FETCH_FAILED', message: error?.message || 'Failed to fetch project' } });
  }
});

// POST create single project
router.post('/', async (req: Request, res: Response) => {
  const db = dbReady();
  if (!db.ok) return dbError(res, db.reason!);
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project.toObject());
  } catch (error: any) {
    res.status(400).json({ ok: false, error: { code: 'CREATE_FAILED', message: error?.message || 'Failed to create project' } });
  }
});

// PUT update project
router.put('/:id', async (req: Request, res: Response) => {
  const db = dbReady();
  if (!db.ok) return dbError(res, db.reason!);
  try {
    const { id } = req.params;
    const project = await Project.findOneAndUpdate(
      { $or: [{ _id: id }, { id }] },
      req.body,
      { new: true, runValidators: true, upsert: false }
    ).lean();
    if (!project) {
      return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
    } else {
      res.json(project);
    }
  } catch (error: any) {
    res.status(400).json({ ok: false, error: { code: 'UPDATE_FAILED', message: error?.message || 'Failed to update project' } });
  }
});

// DELETE project
router.delete('/:id', async (req: Request, res: Response) => {
  const db = dbReady();
  if (!db.ok) return dbError(res, db.reason!);
  try {
    const { id } = req.params;
    const project = await Project.findOneAndDelete({ $or: [{ _id: id }, { id }] });
    if (!project) {
      return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
    } else {
      res.json({ ok: true, message: 'Project deleted' });
    }
  } catch (error: any) {
    res.status(400).json({ ok: false, error: { code: 'DELETE_FAILED', message: error?.message || 'Failed to delete project' } });
  }
});

// POST /batch  o  /replace-all  → sostituisce TUTTI i progetti (salvataggio bulk).
// Stesso comportamento del plugin Vite projectsAdminApi() ma su MongoDB.
// Richiede un array come body. Risponde come /__admin/projects (compatibilità client).
async function handleBatchReplace(req: Request, res: Response) {
  const db = dbReady();
  if (!db.ok) return dbError(res, db.reason!);
  try {
    const incoming = req.body;
    if (!Array.isArray(incoming)) {
      return res.status(400).json({
        ok: false,
        error: { code: 'BAD_REQUEST', message: 'Payload progetti non valido: atteso un array.' },
      });
    }

    const session = await mongoose.startSession();
    let savedDocIds: string[] = [];
    try {
      await session.withTransaction(async () => {
        await Project.deleteMany({}, { session });
        if (incoming.length === 0) {
          savedDocIds = [];
          return;
        }
        const clean = incoming.map((p: any) => {
          const out: any = { ...(p || {}) };
          delete out._id;
          delete out.__v;
          if (!out.id && out._id) out.id = String(out._id);
          return out;
        });
        const inserted = await Project.insertMany(clean, { session, ordered: true });
        savedDocIds = inserted.map((d: any) => String(d._id));
      });
    } finally {
      await session.endSession().catch(() => {});
    }

    const updated = await Project.find().sort(defaultSort).lean();

    res.json({
      ok: true,
      filePath: 'mongodb://projects-collection',
      backupPath: null,
      replaced: true,
      count: updated.length,
      savedIds: savedDocIds,
      data: updated.map(toProjectPayload),
    } as any);
  } catch (error: any) {
    res.status(500).json({
      ok: false,
      error: {
        code: 'BATCH_REPLACE_FAILED',
        message: error?.message || 'Errore durante la sostituzione dei progetti.',
      },
    });
  }
}

router.post('/batch', handleBatchReplace);
router.post('/replace-all', handleBatchReplace);

// Retrocompatibilità con plugin Vite /__admin/projects POST
// Montiamo alias anche su /__admin/projects (route viene usata da projectStore.saveProjectsToProject)
// Nota: Express richiede che l'export sia montato sia su /api/projects che su /__admin/projects
//       in server/index.ts. Qui esponiamo handler riutilizzabile.
export { handleBatchReplace };

export default router;

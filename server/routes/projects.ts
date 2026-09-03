import { Router, Request, Response } from 'express';
import { Project } from '../models/Project.js';

const router = Router();

// GET all projects
router.get('/', async (req: Request, res: Response) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// POST create project
router.post('/', async (req: Request, res: Response) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create project' });
  }
});

// PUT update project
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndUpdate(id, req.body, { new: true });
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
    } else {
      res.json(project);
    }
  } catch (error) {
    res.status(400).json({ error: 'Failed to update project' });
  }
});

// DELETE project
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndDelete(id);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
    } else {
      res.json({ message: 'Project deleted' });
    }
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete project' });
  }
});

export default router;

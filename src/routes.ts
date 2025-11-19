import { Router, Request, Response } from 'express';

const routes = Router()

export default routes;

routes.get('', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SUCCESS FROM API'
  });
});
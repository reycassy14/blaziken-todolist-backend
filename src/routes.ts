import { timeStamp } from 'console';
import { Router, Request, Response } from 'express';

const routes = Router()

export default routes;

//Temporary DB

const now = new Date();

let todoListdata = [{
  id: 1,
  title: "Learn Express",
  description: "In order to learn fullstack web development",
  isCompleted: false,
  createdAt: now
}]

let dataId = 1;

interface todoListdata {
  id: number,
  title: string,
  description: string,
  isCompleted: boolean,
  createdAt: Date
}

routes.get('', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SUCCESS FROM API',
  });
});

//return all items
routes.get('/all-items', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: todoListdata,
  })
})

//return a single existing item
routes.get('/search-item/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  const item = todoListdata.find(t => t.id === id)

  if (!item){
    return res.status(404).json({
      success: false,
      message: 'Item Not Found',
    })
  }

  return res.status(200).json({
    success: true,
    id:item.id,
    data: item,
  })

})

//create a new item
routes.post('/create-item', (req: Request, res: Response) => {
  const {title, description} = req.body;

  if(!title || !description){
    return res.status(400).json({
      success: false,
      message: 'Title or description required!'
    })
  }

const newData : todoListdata = {
  id: dataId++,
  title: title,
  description: description,
  isCompleted: false,
  createdAt : new Date()
}

todoListdata.push(newData);

return res.status(200).json({
  success: true,
  data: todoListdata
})

})

//edit the description in item

routes.patch('/edit-title/:id', (req: Request, res: Response)=> {
  const { title } = req.body
  const id = parseInt(req.params.id)

  const newTitle : todoListdata["title"] = title;
  const itemIndex = todoListdata.findIndex(t => t.id === id)

  if(!title){
    return res.status(404).json({
      success: false,
      message: 'Title not found!'
    })
  }

  if(itemIndex === -1){
    return res.status(404).json({
      success: false,
      message: 'item not found!'
    })
  }

  todoListdata[itemIndex].title = newTitle

  res.status(200).json({
    success: true,
    data: todoListdata[itemIndex]
  })

})
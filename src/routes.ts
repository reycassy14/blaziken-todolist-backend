import { timeStamp } from 'console';
import { Router, Request, Response } from 'express';
import { TodoList } from './todolist.model';
import { ITodoListData } from './todolist.model';
import { StatusCodes } from 'http-status-codes';

const routes = Router()

export default routes;


routes.get('', (req, res) => {
  res.status(200).json({
    status: true,
    message: 'SUCCESS FROM API',
  });
});

//return all items
routes.get('/all-items', async (req: Request, res: Response) => {
  try {
    const todolist = await TodoList.find().sort({createdAt: -1}).lean()
    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      data: todolist,
    })
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: 'error on fetching todolist',
        error: error
    })
  }
})
//return all items
routes.get('/all-items-test', async (req: Request, res: Response) => {
  try {
    const todolist = await TodoList.find().sort({createdAt: -1}).lean()
    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      data: todolist,
    })
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: 'error on fetching todolist',
        error: error
    })
  }
})

//return a single existing item
routes.get('/search-item/:id', async (req: Request, res: Response) => {
  try {
      const { id } = req.params
      const todoItem = await TodoList.findById({id})
    // const item = todoListdata.find(t => t.id === id)
  
    if (!todoItem){
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        message: 'Item Not Found',
      })
    }
  
    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      data: todoItem,
    })

  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: 'error on searching todolist item',
        error: error
    })
  }

})

//create a new item
routes.post('/create-item', async (req: Request, res: Response) => {
  try {
    const {title, description} = req.body as ITodoListData;
  
    if(!title){
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: 'Title required!'
      })
    }

    
  
  const newData  = new TodoList({
    title,
    description
  })

  await newData.save();
  console.log("field: ", newData)
  
  return res.status(StatusCodes.OK).json({
    status: StatusCodes.OK,
    data: newData
  })
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: 'error on creating todolist item',
        error: error
    })
  }

})

//edit the description in item

routes.patch('/edit-item/:id', async (req: Request, res: Response)=> {
  const { title, description } = req.body as ITodoListData
  const  id  = req.params.id

  //const newTitle : ITodoListData["title"] = title;

  try {
    if(!id){
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        message: 'item not found!'
      })
    }

    const updatedFields: Partial<ITodoListData> = {}

    if(title) updatedFields.title = title;
    if(description) updatedFields.description = description;

    if(Object.keys(updatedFields).length === 0){
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: "update atleast one field"
      })
    }

    const updatedItem = await TodoList.findByIdAndUpdate( id, updatedFields , {new: true, runValidators: true})
    
    if(!updatedItem){
        return res.status(StatusCodes.NOT_FOUND).json({
            status: StatusCodes.NOT_FOUND,
            success: false,
            message: 'item not found'
        })
    }
  
    res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: 'Title Successfully Updated',
      data: updatedItem
    })
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: 'error on updating todolist item',
        error: error
    })
  }

})

//update to complete

routes.patch('/toggle-item/:id', async( req:Request, res: Response)=>{
  const id = req.params.id;

  try {

    const currentStatus = await TodoList.findById(id)

      if(!id){
        return res.status(StatusCodes.NOT_FOUND).json({
          status: StatusCodes.NOT_FOUND,
          success: 'false',
          message: 'item not found!'
      })
    }

    const updatedItem = await TodoList.findByIdAndUpdate(id, {isCompleted: !currentStatus?.isCompleted}, {new: true})

    res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: `item marked as ${updatedItem?.isCompleted ? 'completed' : 'incomplete'}`,
      data: updatedItem
    })

  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      message: 'error on updating todolist item',
      error: error
  })
  }
})

//create endpoint for delete
routes.delete('/delete-item/:id', async (req: Request, res: Response)=>{
    const id = req.params.id;

    try {
        if(!id){
            return res.status(StatusCodes.NOT_FOUND).json({
                status: StatusCodes.NOT_FOUND,
                message: 'item not found!'
        })
        }
        const deletedItem = await TodoList.findByIdAndDelete(id)
        if (!deletedItem){
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusCodes.BAD_REQUEST,
                message: 'item already deleted!'
            })
        }
        console.log('Deleted Item: ', deletedItem)
        res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: 'item successfully deleted',
    })
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: 'error on deleting todolist item',
        error: error
    })
    }
})

//delete all completed item
routes.delete('/batch-delete', async (req: Request, res: Response)=>{
  try {
    const completedItems = await TodoList.find({isCompleted: true}).sort({createdAt: -1})

    if(!completedItems.length){
      console.log('No completed Items')
      return res.status(StatusCodes.ACCEPTED).json({
        status: StatusCodes.ACCEPTED,
        message: 'No Completed Items',
        data: completedItems
      })
    }

    const result = await TodoList.deleteMany({ isCompleted: true })

    res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: `Successfully Deleted ${result.deletedCount} Items` ,
      deletedItems: completedItems,
    })
  } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: 'error on deleting todolist item',
        error: error
    })
  }
})

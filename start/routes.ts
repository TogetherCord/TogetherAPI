/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {return { TogetherAPI: 'Good !' }})

Route.group(() => {
  Route.get('/ping', 'PingController.handle')
}).prefix('/manager')

Route.group(() => {
  Route.post('/containers/create', 'ContainersController.create');
  Route.post('/containers/delete', 'ContainersController.delete');
  Route.post('/containers/stop', 'ContainersController.stop');
  Route.post('/containers/start', 'ContainersController.start');
  Route.post('/containers/restart', 'ContainersController.restart');
  Route.post('/containers/status', 'ContainersController.status');
  Route.post('/containers/execute', 'ContainersController.execute')
}).prefix('/instance')


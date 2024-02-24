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
  Route.get('/status', 'ContainersController.dockerinfo').middleware('apiAuth');
}).prefix('/manager')

Route.group(() => {
  Route.post('/upload', 'ReceiveController.upload').middleware('apiAuth');
  Route.get('/download', 'ReceiveController.download').middleware('apiAuth');
}).prefix('/files')

Route.group(() => {
  Route.post('/containers/create', 'ContainersController.create').middleware('apiAuth');
  Route.post('/containers/delete', 'ContainersController.delete').middleware('apiAuth');
  Route.post('/containers/stop', 'ContainersController.stop').middleware('apiAuth');
  Route.post('/containers/start', 'ContainersController.start').middleware('apiAuth');
  Route.post('/containers/restart', 'ContainersController.restart').middleware('apiAuth');
  Route.post('/containers/status', 'ContainersController.status').middleware('apiAuth');
  Route.post('/containers/execute', 'ContainersController.execute').middleware('apiAuth');
  Route.post('/containers/exists', 'ContainersController.exists').middleware('apiAuth');
  Route.get('/containers/connected', 'ContainersController.listconnected').middleware('apiAuth');
  Route.post('/containers/restartall', 'ContainersController.restartall').middleware('apiAuth');
  Route.get('/containers/list', 'ContainersController.howmanyuser').middleware('apiAuth');
}).prefix('/instance')

Route.group(() => {
    Route.post('/self', 'UpdateController.pushupdate').middleware('apiAuth')
    Route.get('/get', 'UpdateController.getupdate').middleware('apiAuth')
    Route.get('/version', 'UpdateController.getversion').middleware('apiAuth')
}).prefix('/update')


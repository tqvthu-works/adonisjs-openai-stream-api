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

import OpenAI from 'openai'
import Route from '@ioc:Adonis/Core/Route'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
const  sleep = async (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const openai = new OpenAI({
  apiKey: '{your_openai_key}',
})

Route.get('/home', async ({ response }: HttpContextContract) => {
  response.send(`  
    <!DOCTYPE html>  
    <html>  
        <body>  
            <h1>SSE Example:</h1>  
            <div id="result"></div>  
            <script>  
                var source = new EventSource("/sse");  
                source.onmessage = function(event) {
                  console.log(event.data);
                  document.getElementById("result").innerHTML += event.data + " ";  
                };  
            </script>  
        </body>  
    </html>  
`)
})

Route.get('/sse', async ({ response }: HttpContextContract) => {
  response.response.setHeader('Content-Type', 'text/event-stream')

  const stream = await openai.chat.completions.create(
    {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: 'What is the capital of America',
        },
      ],
      temperature: 0,
      stream: true,
    }
  )
  for await (const part of stream) {
    await sleep(1000);
    response.response.write(`data: ${part.choices[0]?.delta?.content || ''}\n\n`);
  }
  response.response.on('close', () => {
    response.response.end()
  })
})

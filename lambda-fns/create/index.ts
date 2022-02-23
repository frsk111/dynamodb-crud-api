import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { DynamoDB, PutItemInput } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import { v4 as uuid } from 'uuid'

interface TodoInput {
    id?: string
    title: string
    done: boolean 
}

interface Todo {
    id: string
    title: string
    done: boolean 
}

export async function createTodo(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
    
    console.log("EVENT --->" + event);
    

    // estraiamo il body dall'evento
    const { body } = event

    console.log("BODY --->" + body);
    

    // se il body non è definito allora si invia il messaggio di errore 
    if (!body) {

        return sendFail('invalid request !!')
    }

    // analizziamo la stringa del body ed estraiamo le variabili id, title e done
    const { id, title, done } = JSON.parse(body) as TodoInput

    const dynamoClient = new DynamoDB({ 
        region: 'us-east-1' 
    })

    // se l'id non è presente lo si genera automaticamente
    const newTodo: Todo = {
        id: id ?? uuid(),
        title, done
    }

    // creazione l'input adattato per il metodo putItem
    const todoParams: PutItemInput = {
        Item: marshall(newTodo),
        TableName: process.env.TODO_TABLE_NAME
    }

    try {

        await dynamoClient.putItem(todoParams)
        
        return {
            statusCode: 200,
            body: JSON.stringify({ newTodo })    
        }

    } catch (err) {

        console.log(err)

        return sendFail('something went wrong')
    }
}

function sendFail(message: string): APIGatewayProxyResultV2 {
    
    return {
        statusCode: 400,
        body: JSON.stringify({ message })
    }
}
import { aws_apigateway, CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from "constructs"
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { todoTableName } from './variables';
export class DynamodbCrudApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // -- parte di creazione tabella
    const todoTable = new Table(this, 'todoTable', {
    tableName: 'dbProva4',
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING
      },
      billingMode: BillingMode.PROVISIONED,
      removalPolicy: RemovalPolicy.DESTROY
    })
    
    new CfnOutput(this, 'todoTableName', {
      value: todoTable.tableName
    })
    // -- //


    // -- parte di inserimento dato in tabella (create)
    const createTodoFn = new NodejsFunction(this, 'createTodoFn', {
      runtime: Runtime.NODEJS_14_X,
      entry: `${__dirname}/../lambda-fns/create/index.ts`,
      handler: 'createTodo',
      environment: {
        TODO_TABLE_NAME: todoTableName
      }
    })
    
    // autorizzazioni ruoli
    todoTable.grantReadWriteData(createTodoFn)
    // -- //
        

    // api rest
    new aws_apigateway.LambdaRestApi(this,'EndpointCrud',{
      handler: createTodoFn
    })
    //

  }
}

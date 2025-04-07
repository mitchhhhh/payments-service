import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse, HttpStatusCodes } from './lib/apigateway';
import { getPayment } from './lib/payments';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log(`getPayments ${event}`)
    const paymentId = event.pathParameters?.id
    if (!paymentId) // I don't think this should be possible, this request would go to listPayments. But checking anyway just in case
        return buildResponse(HttpStatusCodes.BAD_REQUEST, { message: "payment id not provided" })

    const payment = await getPayment(paymentId)
    if (payment == null)
        return buildResponse(HttpStatusCodes.NOT_FOUND, { message: `Payment ID ${paymentId} not found` })
    return buildResponse(HttpStatusCodes.OK, payment)
};

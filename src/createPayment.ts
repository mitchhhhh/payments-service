import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse, HttpStatusCodes, parseInput } from './lib/apigateway';
import { createPayment, Payment } from './lib/payments';
import { randomUUID } from 'crypto';
import { code } from 'currency-codes';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log(`createPayment ${event}`)
    try {
        var createPaymentRequest = validateRequest(event.body || '{}');
    } catch (e: any) {
        console.log(`User input error: ${e}`)
        return buildResponse(HttpStatusCodes.BAD_REQUEST, { message: e.message })
    }

    const payment: Payment = {
        paymentId: randomUUID(),
        amount: createPaymentRequest.amount,
        currency: createPaymentRequest.currency
    }
    await createPayment(payment);
    return buildResponse(HttpStatusCodes.CREATED, { result: payment.paymentId });
};

const validateRequest = function (request: string): CreatePaymentRequest {
    console.log(request)
    const parsedRequest = parseInput(request) as any
    const parsedNumber = parseFloat(parsedRequest.amount)
    if (!parsedNumber)
        throw Error(`Invalid amount: ${parsedRequest.amount}`)

    const parsedCurrency = code(parsedRequest.currency)
    if (!parsedCurrency)
        throw Error(`Invalid currency: ${parsedRequest.currency}`)

    return {
        amount: parsedNumber,
        currency: parsedCurrency.code
    } as CreatePaymentRequest
}

type CreatePaymentRequest = {
    amount: number,
    currency: string
    // We ideally need a request ID for idempotency if the IDs are server side generated.
    // The request IDs could have a TTL of say, 24 hours, but could be less/more depending
    // on SLAs & requirements. Most ways of implementing this feel out of scope for this exercise,
    // this could be done as a uniqueness constraint on the DB - but given DynamoDB doesn't
    // really support uniqueness constraints I've opted to not support this.
    //requestId: createPaymentRequest.requestId
}

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse, HttpStatusCodes, parseInput } from './lib/apigateway';
import { listPayments } from './lib/payments';
import { code } from 'currency-codes';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log(event)
    try {
        var request = parseRequest(event)
    } catch (e: any) {
        console.log(`User input error: ${e}`)
        return buildResponse(HttpStatusCodes.BAD_REQUEST, { message: e.message })
    }

    const payments = request.currency ? listPayments(request.currency) : listPayments()
    return buildResponse(HttpStatusCodes.OK, { data: await payments });
};

const parseRequest = function (event: APIGatewayProxyEvent): ListPaymentsRequest {
    const currencyParam = event.queryStringParameters?.currency
    if (currencyParam) {
        const parsedCurrency = code(currencyParam)
        if (!parsedCurrency)
            throw Error(`Invalid currency: ${currencyParam}`)

        return { currency: parsedCurrency.code }
    } else {
        return {}
    }

}

type ListPaymentsRequest = {
    currency?: string
}

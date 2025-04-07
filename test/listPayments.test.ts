import * as payments from '../src/lib/payments';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../src/listPayments';
import { HttpStatusCodes } from '../src/lib/apigateway';

describe('When the user requests a list of payments', () => {
    it('returns the expected list', async () => {
        const mockPayment = {
            paymentId: 'test1',
            currency: 'AUD',
            amount: 2000,
        };
        const mockPayment2 = structuredClone(mockPayment)
        mockPayment2.paymentId = 'test2'
        const listPaymentsMock = jest.spyOn(payments, 'listPayments').mockResolvedValueOnce([mockPayment, mockPayment2]);

        const result = await handler({} as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(HttpStatusCodes.OK);
        expect(JSON.parse(result.body)).toEqual({ data: [mockPayment, mockPayment2] });

        expect(listPaymentsMock).toHaveBeenCalled();
    });
})

describe('When the user requests a list of payments for a specific currency', () => {
    it('returns the payments for the given currency', async () => {
        const currency = 'SGD'
        const mockPayment = {
            paymentId: 'test1',
            currency: 'AUD',
            amount: 2000,
        };
        const mockPayment2 = structuredClone(mockPayment)
        mockPayment2.paymentId = 'test2'
        mockPayment2.currency = currency

        const listPaymentsMock = jest.spyOn(payments, 'listPayments').mockResolvedValueOnce([mockPayment2]);

        const result = await handler({
            queryStringParameters: { currency: 'SGD' }
        } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(HttpStatusCodes.OK);
        expect(JSON.parse(result.body)).toEqual({ data: [mockPayment2] });

        expect(listPaymentsMock).toHaveBeenCalledWith(currency);
    })

    it('returns a 400 when the currency is invalid', async () => {
        const currency = 'australian dollarydoos'

        const result = await handler({
            queryStringParameters: { currency: currency }
        } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(HttpStatusCodes.BAD_REQUEST);
    })
})

afterEach(() => {
    jest.resetAllMocks();
});
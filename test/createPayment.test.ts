import * as payments from '../src/lib/payments';
import * as crypto from "crypto"
import { handler } from '../src/createPayment';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { HttpStatusCodes } from '../src/lib/apigateway';

describe('When the user creates a payment.', () => {
    it('Should use an ID which is randomly generated.', async () => {
        const paymentId = crypto.randomUUID()
        const currency = "AUD"
        const amount = 100

        const randomUUIDMock = jest.spyOn(crypto, "randomUUID").mockImplementationOnce(() => paymentId)
        const createPaymentMock = jest.spyOn(payments, "createPayment").mockResolvedValueOnce()

        const result = await handler({
            body: JSON.stringify({ amount, currency }),
        } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(HttpStatusCodes.CREATED);
        expect(JSON.parse(result.body)).toEqual({ result: paymentId });

        const expectedPayment = {
            paymentId,
            amount,
            currency
        }
        expect(randomUUIDMock).toHaveBeenCalled()
        expect(createPaymentMock).toHaveBeenCalledWith(expectedPayment);
    })

    it('Should ensure the curreny is valid', async () => {
        const currency = "I'm a real currency, trust me"
        const amount = 100

        const result = await handler({
            body: JSON.stringify({ amount, currency }),
        } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(HttpStatusCodes.BAD_REQUEST);
    })

    it('Should ensure the curreny is provided', async () => {
        const amount = 100

        const result = await handler({
            body: JSON.stringify({ amount }),
        } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(HttpStatusCodes.BAD_REQUEST);
    })

    it('Should ensure the amount is valid', async () => {
        const currency = "AUD"
        const amount = "dkfjh"

        const result = await handler({
            body: JSON.stringify({ amount, currency }),
        } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(HttpStatusCodes.BAD_REQUEST);
    })

    it('Should ensure the amount is provided', async () => {
        const currency = "AUD"

        const result = await handler({
            body: JSON.stringify({ currency }),
        } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(HttpStatusCodes.BAD_REQUEST);
    })
})

afterEach(() => {
    jest.resetAllMocks();
});
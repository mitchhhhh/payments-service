import * as payments from '../src/lib/payments';
import { randomUUID } from 'crypto';
import { handler } from '../src/getPayment';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { HttpStatusCodes } from '../src/lib/apigateway';

describe('When the user requests the records for a specific payment', () => {
    it('Returns the payment matching their input parameter.', async () => {
        const paymentId = randomUUID();
        const mockPayment = {
            paymentId,
            currency: 'AUD',
            amount: 2000,
        };
        const getPaymentMock = jest.spyOn(payments, 'getPayment').mockResolvedValueOnce(mockPayment);

        const result = await handler({
            pathParameters: {
                id: paymentId,
            },
        } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(HttpStatusCodes.OK);
        expect(JSON.parse(result.body)).toEqual(mockPayment);

        expect(getPaymentMock).toHaveBeenCalledWith(paymentId);
    });

    it('Returns 404 if there is no matching payment.', async () => {
        const paymentId = randomUUID();
        const getPaymentMock = jest.spyOn(payments, 'getPayment').mockResolvedValueOnce(null);

        const result = await handler({
            pathParameters: {
                id: paymentId,
            },
        } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(HttpStatusCodes.NOT_FOUND);
        expect(getPaymentMock).toHaveBeenCalledWith(paymentId);
    });

    it('Returns 400 if no ID is provided', async () => {
        const result = await handler({ pathParameters: {} } as unknown as APIGatewayProxyEvent);
        expect(result.statusCode).toBe(HttpStatusCodes.BAD_REQUEST);
    });
});

afterEach(() => {
    jest.resetAllMocks();
});

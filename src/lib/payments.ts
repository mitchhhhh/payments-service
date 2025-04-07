import { DocumentClient } from './dynamodb';
import { GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

export const getPayment = async (paymentId: string): Promise<Payment | null> => {
    const result = await DocumentClient.send(
        new GetCommand({
            TableName: 'PaymentsTable',
            Key: { paymentId },
        })
    );

    return (result.Item as Payment) || null;
};

export const listPayments = async (currency?: string): Promise<Payment[]> => {
    var currencyFilter = {}
    if (currency) {
        currencyFilter = {
            FilterExpression: 'currency = :ccy',
            ExpressionAttributeValues: { ':ccy': currency }
        }
    }
    const result = await DocumentClient.send(
        new ScanCommand({
            TableName: 'PaymentsTable',
            ...currencyFilter
        })
    );

    return (result.Items as Payment[]) || [];
};

export const createPayment = async (payment: Payment) => {
    const result = await DocumentClient.send(
        new PutCommand({
            TableName: 'PaymentsTable',
            Item: payment,
        })
    );
};

export type Payment = {
    paymentId: string;
    amount: number;
    currency: string;
};

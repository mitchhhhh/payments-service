import { APIGatewayProxyResult } from 'aws-lambda';

export enum HttpStatusCodes {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    NOT_FOUND = 404
};

export const buildResponse = (statusCode: HttpStatusCodes, body: Object): APIGatewayProxyResult => {
    return {
        statusCode,
        body: JSON.stringify(body),
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
    };
};

export const parseInput = (body: string): Object => {
    try {
        return JSON.parse(body);
    } catch (err) {
        console.error(err);
        return {};
    }
};

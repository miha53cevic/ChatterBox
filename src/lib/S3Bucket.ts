import { GetObjectCommand, PutBucketCorsCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export const client = new S3Client({
    region: 'eu-west-1',
    credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY || '',
        secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET || '',
    }
});

export async function S3PutCORS() {
    await client.send(new PutBucketCorsCommand({
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET || '',
        CORSConfiguration: {
            CORSRules: [
                {
                    "AllowedHeaders": [
                        "*"
                    ],
                    "AllowedMethods": [
                        "GET",
                        "HEAD",
                        "POST",
                        "PUT",
                    ],
                    "AllowedOrigins": [
                        "*"
                    ],
                    "ExposeHeaders": []
                }
            ]
        }
    }));
};


export async function S3Upload(key: string, publicFile: boolean, file: File) {
    const command = new PutObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET || '',
        Key: publicFile ? `public/public/${key}` : `${key}`,
        Body: file,
    });

    const response = await client.send(command);
    return response;
};

export async function S3Get(key: string, publicFile: boolean) {
    const command = new GetObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET || '',
        Key: publicFile ? `public/${key}` : `${key}`,
    });

    const response = await client.send(command);
    return {
        response: response,
        data: response.Body
    };
};
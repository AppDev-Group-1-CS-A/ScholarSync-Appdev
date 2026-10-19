import {NextResponse} from "next/server";
import {handleUpload, HandleUploadBody} from "@vercel/blob/client";
import {getSession} from "@/lib/auth";
import {MAX_FILE_SIZE} from "@/lib/constants";

export async function POST(request: Request): Promise<NextResponse> {
    try {
        // Double check session before even looking at the request body
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = (await request.json()) as HandleUploadBody;
        const token = process.env.BLOB_READ_WRITE_TOKEN;
        
        if (!token) {
            throw new Error('Missing BLOB_READ_WRITE_TOKEN environment variable');
        }

        const jsonResponse = await handleUpload({
            token: token,
            body,
            request,
            onBeforeGenerateToken: async () => {
                // Re-verify during token generation
                const s = await getSession();
                const userId = s?.userId;

                if(!userId) {
                    throw new Error('Unauthorized: User not authenticated');
                }

                return {
                    allowedContentTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
                    addRandomSuffix: true,
                    maximumSizeInBytes: MAX_FILE_SIZE,
                    tokenPayload: JSON.stringify({ userId })
                }
        } ,
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                const payload = tokenPayload ? JSON.parse(tokenPayload): null
                const userId = payload?.userId;
                console.log(`Upload completed for user: ${userId}, URL: ${blob.url}`);
            }
        });

        return NextResponse.json(jsonResponse)
    } catch (e) {
        const message = e instanceof Error ? e.message : "An unknown error occurred";
        const status = message.includes('Unauthorized') ? 401 : 500;
        console.error('Upload error', e);
        const clientMessage = status === 401 ? 'Unauthorized' : 'Upload failed';
        return NextResponse.json({ error: clientMessage }, { status });
    }
}

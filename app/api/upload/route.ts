import { NextResponse } from 'next/server';
import { uploadFileToR2 } from '@/lib/storage/r2';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const isValidImage = (file: File) => file.type.startsWith('image/');

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!isValidImage(file)) {
      return NextResponse.json(
        { error: 'Solo se permiten archivos de imagen' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'La imagen supera el máximo de 10MB' },
        { status: 400 }
      );
    }

    const uploadedFile = await uploadFileToR2(file);

    return NextResponse.json({ url: uploadedFile.url, key: uploadedFile.key });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}


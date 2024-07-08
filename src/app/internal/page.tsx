// import Image from 'next/image';
// import { TokenGate } from '@/components/TokenGate';
// import { getSession } from '@/utils/session';

// /**
//  * The revalidate property determine's the cache TTL for this page and
//  * all fetches that occur within it. This value is in seconds.
//  */
// export const revalidate = 180;

// async function Content({ searchParams }: { searchParams: SearchParams }) {
//   const data = await getSession(searchParams);
//   // Console log the data to see what's available
//   // You can see these logs in the terminal where
//   // you run `yarn dev`
//   console.log({ data });
//   return (
//     <main className="flex min-h-screen flex-col items-center justify-between p-24">
//       <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
//         <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
//           Internal Page&nbsp;
//           {data.internalUser && (
//             <code className="font-mono font-bold">
//               — Logged in as {data.internalUser.givenName}{' '}
//               {data.internalUser.familyName}
//             </code>
//           )}
//         </p>
//         <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
//           <a
//             className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
//             href="https://copilot.com"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             By{' '}
//             <Image
//               src="/copilot_icon.png"
//               alt="Copilot Icon"
//               className="dark:invert"
//               width={24}
//               height={24}
//               priority
//             />
//           </a>
//         </div>
//       </div>

//       <div className="flex-col mb-32 text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
//         <h2 className={`mb-3 text-2xl font-semibold`}>
//           This page is served to internal users.
//         </h2>
//         <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
//           This is an example of a page that is served to internal users only.
//         </p>
//       </div>
//     </main>
//   );
// }

// export default async function Page({
//   searchParams,
// }: {
//   searchParams: SearchParams;
// }) {
//   return (
//     <TokenGate searchParams={searchParams}>
//       <Content searchParams={searchParams} />
//     </TokenGate>
//   );
// }

'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { adapticServer } from '../../utils/helpers';
import UseStore from '../../results';

const FileUploadComponent: React.FC = () => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const upload = UseStore.useUploadStore(state => state.upload);
  const setUpload = UseStore.useUploadStore(state => state.setUpload);

  // Progress messages
  const progressMessages = [
    'Analyzing document...',
    'Extracting key information...',
    'Comparing with clinical trials...',
    'Finalizing results...'
  ];

  useEffect(() => {
    if (!loading) {
      return;
    }
    let messageIndex = 0;
    const intervalId = setInterval(() => {
      if (messageIndex < progressMessages.length) {
        setProgressMessage(progressMessages[messageIndex]);
        messageIndex++;
      } else {
        clearInterval(intervalId); // Stop updating once the last message is reached
      }
    }, 6000);

    return () => clearInterval(intervalId);
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files ? event.target.files[0] : null;
    if (uploadedFile) {
      setFile(uploadedFile);
    }
  };

  const handleFileUpload = async () => {
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        setError(false);
  
        const response = await axios.post(`${adapticServer}uploadPDF`, formData, {
          headers: {
              'Content-Type': 'multipart/form-data'
          },
          responseType: 'blob' // This is important to handle the file response correctly
      });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'filled_form.pdf'); // Set the file name
        document.body.appendChild(link);
        link.click();
        link.remove();

        console.log('Success:', response.data);
        setUpload(response.data);
        setFile(null);
        setTimeout(() => {
            setLoading(false);
        }, 2000);
    } catch (error) {
        console.error('Error:', error);
        setLoading(false);
        setError(true);
    }
  }
  };

  return (
    <div>
        <div className="flex flex-col items-center justify-center p-6 rounded-lg min-h-screen bg-white">
            <h1 className="text-3xl font-semibold mb-4 text-center">Upload Medical Claim Form</h1>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="border border-2 border-blue-300 rounded-lg p-4"
          />
          <button
            onClick={handleFileUpload}
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-2'
          >
            Upload File
          </button>
          {loading && (
              <div className="text-center">
                <div className="flex justify-center items-center">
                  {/* Replace with your actual loading spinner */}
                  <div className="spinner"></div>
                </div>
                <p className="text-blue-500 mt-2">{progressMessage}</p>
              </div>
          )}
          {error && (
            <div className="text-red-500">Something went wrong. Please try again.</div>
          )}
        </div>
    </div>
  );
};

export default FileUploadComponent;

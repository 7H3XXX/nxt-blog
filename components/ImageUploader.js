import { useState } from 'react';
import { auth, storage } from '../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Loader from './Loader';
import toast from 'react-hot-toast';

export default function ImageUploader() {

    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [downloadURL, setDownloadURL] = useState(null);

    const uploadFile = async (e) => {
        //choose the first file selected by the user
        const file = Array.from(e.target.files)[0];
        const extension = file.type.split('/')[1];

        //get the firebase bucket, save in uploads/uid/date.extension
         const refBucket = ref(storage, `uploads/${auth.currentUser.uid}/${Date.now()}.${extension}`);
         setUploading(true);

         const uploadTask = uploadBytesResumable(refBucket, file);

         uploadTask.on('state_changed', (snapshot) => {
             // Observe state change events such as progress, pause, and resume
             // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
             const pct = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100);

             setProgress(pct);
         },
             (error) => {
                 // Handle unsuccessful uploads
                 toast.error('Error when uploading the file');
                 setUploading(false);
                 console.log(error)
             },
             () => {
                 // Handle successful uploads on complete
                 // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                 getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                     setDownloadURL(downloadURL);
                     setUploading(false);
                 });
             }
         )
    }

    return (
        <div className="box">
            <Loader show={uploading} />
            {uploading && <h3>{progress}%</h3>}

            {!uploading && (
                <>
                    <label className="btn">
                        📸 Upload Img
                        <input type="file" onChange={uploadFile} accept="image/x-png,image/gif,image/jpeg" />
                    </label>
                </>
            )}

            {downloadURL && <code className="upload-snippet">{`![alt](${downloadURL})`}</code>}
        </div>
    )
}
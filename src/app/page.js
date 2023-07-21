'use client'

import Image from 'next/image';
import { useState } from "react";

function ImageUpload({ className, setImg, img, setImgURL, setLoading, setResultURL }) {

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (img == null) {
      return; // maybe add a notice to select an image in the future
    }
    setLoading(true);

    const formData = new FormData(e.target);
    const res = await fetch(process.env.NEXT_PUBLIC_API_SERVER + '/segment/', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const resJson = await res.json();
      const data = await fetch(process.env.NEXT_PUBLIC_API_SERVER + resJson.resultPath);
      const blob = await data.blob();
      setResultURL(URL.createObjectURL(blob));
    }

    setLoading(false);
  }

  return (
    <form className={`w-full items-center flex lg:flex-col lg:gap-8 justify-evenly gap-4 ${className}`} onSubmit={handleFormSubmit} method="POST" encType="multipart/form-data" action="http://localhost:8000/segment">
      <input
        type="file"
        id="image-upload"
        accept="image/*"
        className="w-4/5"
        name="image"
        onChange={(e) => {
          if (e.target.files.length > 0) {
            setImg(e.target.files[0]);
            setImgURL(URL.createObjectURL(e.target.files[0]));
          }
        }}
      />
      <label className="border-mauve border-b-4 p-2 lg:mt-4 border-dashed text-slate-700 font-medium text-xl text-center 
                        transition-transform duration-300 hover:-translate-y-1
                        hover:cursor-pointer" htmlFor="image-upload">{img ? img.name : "Select an image"}</label>
      <button 
        className="pl-4 pr-4 h-16 lg:w-32 lg:h-32 lg:mt-8 rounded-full bg-mauve 
                   text-white font-semibold text-xl 
                   transition duration-200 shadow-md transform hover:scale-110"
        type="submit"
      >
        Segment!
      </button>
    </form>
  )
}

function LogoDisplay({ className }) {
  return (
    <div className={`${className} bg-slate-200 flex flex-col items-center gap-8`} >
      <div className="rounded-full overflow-hidden shadow-lg">
      <Image
        src="/1.png"
        alt="Lila logo"
        className="w-32 h-32"
        width={100}
        height={100}
      />
      </div>
      <h1 className="text-3xl font-bold text-center text-slate-700" >Lila AI Demo</h1>
    </div>
  )
}

function ControlBar({ className, setImg, img, setImgURL, setLoading, setResultURL }) {
  return (
    <div className={`w-full shadow-[0_-1px_15px_rgba(0,0,0,0.25)] bg-slate-200 flex flex-col items-center p-8 gap-8 ${className}`}>
      <LogoDisplay /> 
      <ImageUpload setImg={setImg} setImgURL={setImgURL} setLoading={setLoading} setResultURL={setResultURL} img={img} />
    </div>
  )
}

// maybe free the unused image blob urls

function ImageCard({ src, className }) {
  return (
    <div className={`relative transition-transform duration-300 hover:-translate-y-2 ${className}`}>
      <Image
        src={src}
        alt="Original image"
        className="rounded-xl w-full h-full min-h-[200px] object-cover shadow-lg"
        width="100"
        height="100"
      />
      <div 
        className="rounded-xl absolute inset-0 bg-black opacity-0 hover:opacity-50 flex items-center justify-center transition-opacity duration-300 cursor-pointer"
        onClick={() => window.open(src, '_blank')}
      >
        <span className="text-white text-6xl text-center font-bold">View Full</span>
      </div>
    </div>
  )
}

function EmptyCard({ children, className }) {
  return (
    <p className={`w-full h-full object-cover min-h-[200px]
                  transition-transform duration-300 hover:-translate-y-2 
                  text-4xl text-slate-300 font-bold text-center
                  flex items-center justify-center
                  border-dotted border-4 rounded-xl p-4 ${ className }`} 
    >{ children }</p>
  )
}

function MainDisplay({ className, img, imgURL, loading, resultURL }) {
  return (
    <div className={`${className} lg:grid lg:grid-rows-2 lg:grid-cols-3 flex flex-col gap-8 p-8 bg-slate-50`} >
      {
        img ? (
          <ImageCard src={imgURL} className="col-start-1 col-end-3" />
        ) : (
          <EmptyCard className="col-start-1 col-end-3">Original Image</EmptyCard>
        )
      }
      <Image
        src="/arrow5.svg"
        alt="Arrow svg"
        className="hidden col-start-1 col-end-2 w-full h-full lg:block"
        width="100"
        height="100"
      />
      { 
        loading ? (
          <EmptyCard className="col-start-2 col-end-4 animate-pulse">Processing...</EmptyCard>
        ) : (
          (resultURL == "") ? (
            <EmptyCard className="col-start-2 col-end-4">Segmented Image</EmptyCard>
          ) : (
            <ImageCard src={resultURL} className="col-start-2 col-end-4" />
          )
        )
      }
    </div>
  )
}

export default function Home() {
  const [img, setImg] = useState(null);
  const [imgURL, setImgURL] = useState("");
  const [resultURL, setResultURL] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="h-screen w-screen flex flex-col lg:flex-row">
      <ControlBar className="lg:w-1/5" setImg={setImg} setImgURL={setImgURL} img={img} setLoading={setLoading} setResultURL={setResultURL} />
      <MainDisplay img={img} imgURL={imgURL} loading={loading} resultURL={resultURL} className="flex-grow" />
    </div>
  );
}

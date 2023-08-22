'use client'

import Image from 'next/image';
import { useState } from "react";

function ImageUpload({ className, setImg, img, setImgURL, setSegState, setResultURL }) {

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (img == null) {
      alert("Please select an image first!")
      return; 
    }
    setSegState(1); // loading state

    const formData = new FormData(e.target);

    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_SERVER + '/segment/', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const resJson = await res.json();
        const data = await fetch(process.env.NEXT_PUBLIC_API_SERVER + resJson.resultPath);
        if (data.ok) {
          const blob = await data.blob();
          setResultURL(URL.createObjectURL(blob));
          setSegState(0); // normal state
        } else {
          setSegState(2); // error retry state
        }
      } else {
        setSegState(2); // error retry state
      }
    } catch (e) {
      console.error("WE GOT AN ERROR, IT HAPPENS LMAO: ", e);
      setSegState(2); // error retry state
    }
  }

  return (
    <form className={`w-full items-center flex flex-col lg:gap-8 justify-evenly gap-4 ${className}`} onSubmit={handleFormSubmit} method="POST" encType="multipart/form-data" action="http://localhost:8000/segment">
      <div className="flex justify-evenly w-full gap-4 lg:flex-col">
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
        <label className="border-mauve border-b-4 p-2 border-dashed text-slate-700 font-medium text-lg text-center 
                          transition-transform duration-300 hover:-translate-y-1 hover:cursor-pointer" 
              htmlFor="image-upload">{img ? img.name : "Select an image"}</label>

        <select id="model-select" name="model" required style={{textAlignLast: "center"}}
          className="border-mauve border-b-4 p-2 border-dashed
                     text-slate-700 font-medium text-lg p-2.5 bg-slate-200
                     transition-transform duration-300 hover:-translate-y-1 hover:cursor-pointer">
          <option value="" selected>Select a model</option>
          <option value="pspnet">PSPNet</option>
          <option value="segformer">Segformer</option>
        </select>
      </div>

      <button 
        className="pl-4 pr-4 h-16 mt-4 lg:w-32 lg:h-32 lg:mt-0 rounded-full bg-mauve 
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

function ControlBar({ className, setImg, img, setImgURL, setSegState, setResultURL }) {
  return (
    <div className={`w-full shadow-[0_-1px_15px_rgba(0,0,0,0.25)] bg-slate-200 flex flex-col items-center p-8 gap-8 ${className}`}>
      <LogoDisplay /> 
      <ImageUpload setImg={setImg} setImgURL={setImgURL} setSegState={setSegState} setResultURL={setResultURL} img={img} />
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

function MainDisplay({ className, img, imgURL, segState, resultURL }) {
  let card;
  if (segState == 0) { // normal
    if (resultURL == "") {
      card = <EmptyCard className="col-start-2 col-end-4">Segmented Image</EmptyCard>;
    } else {
      card = <ImageCard src={resultURL} className="col-start-2 col-end-4" />;
    }
  } else if (segState == 1) { // loading
    card = <EmptyCard className="col-start-2 col-end-4 animate-pulse">Processing...</EmptyCard>;
  } else { // error
    card = <EmptyCard className="col-start-2 col-end-4">ERROR: RETRY</EmptyCard>;
  }
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
      {card}
    </div>
  )
}

export default function Home() {
  const [img, setImg] = useState(null);
  const [imgURL, setImgURL] = useState("");
  const [resultURL, setResultURL] = useState("");
  const [segState, setSegState] = useState(0); // 0 - normal (either no image segmented yet, or one successfully segmented, depending on resultURL), 1 - loading, 2 - error retry

  return (
    <div className="h-screen w-screen flex flex-col lg:flex-row">
      <ControlBar className="lg:w-1/4" setImg={setImg} setImgURL={setImgURL} img={img} setSegState={setSegState} setResultURL={setResultURL} />
      <MainDisplay img={img} imgURL={imgURL} segState={segState} resultURL={resultURL} className="flex-grow" />
    </div>
  );
}

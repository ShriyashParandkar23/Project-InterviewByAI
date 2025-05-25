import React from "react";
import Webcam from "react-webcam";

const CustomWebcam = () => {
  return (
    <Webcam
    className='h-full'
      audio={false}
      height="100%"
      width="100%"
      videoConstraints={{
        facingMode: "user",
      }}
    />
  );
};

export default CustomWebcam;
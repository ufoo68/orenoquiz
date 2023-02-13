import { type NextPage } from "next";
import SignatureCanvas from 'react-signature-canvas'
import { useWindowSize } from "../../../hooks/useWindowSize";

const Answere: NextPage = () => {
  const { width, height } = useWindowSize();
  return (
    <div className="p-10">
      <SignatureCanvas penColor='black'
        canvasProps={{ width, height, className: 'sigCanvas' }} />
    </div>
  );
};

export default Answere;

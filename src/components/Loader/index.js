
import { BiLoaderAlt } from "react-icons/bi"


function Loader({ text = "Fetching Data", type = "loading" }) {

    return (
        <div className="w-full h-[450px] flex flex-col items-center justify-center">
            {type === "loading" && <BiLoaderAlt id="loader-comp" className=" text-[60px] text-dark-100 " />}
            <br />
            <p className="ml-1 text-dark-200 font-extrabold text-[18px] capitalize ">{text}</p>
            {type === "error" && <span className="text-dark-100 underline font-extrabold text-[15px] cursor-pointer" onClick={() => window.location.reload(true)}>Try Reloading.</span>}
        </div>
    )
}

export default Loader
import { AiFillStar } from "react-icons/ai";

export function StarRate({ count, color = "", size = 15 }) {
  return (
    <>
      {Array(count)
        .fill()
        .map((list, i) => {
          return (
            <AiFillStar
              key={i}
              className={`text-[20px] `}
              style={{
                color: color === "" ? "#64f4acea" : color,
                fontSize: `${size}px`,
              }}
            />
          );
        })}
    </>
  );
}

export function Input({ ...rest }) {
  return (
    <input
      {...rest}
      className={`w-full rounded-md ourtline-none bg-dark-200 px-3 py-2 mt-2 text-white-200 `}
    />
  );
}

export function SelectInput({ data = [], title = "select title", ...rest }) {
  return (
    <>
      <select className="w-full h-auto px-3 py-3 mt-1 rounded-md bg-dark-200 text-white-100" {...rest}>
        <option value="">{title}</option>
        {data.map((list, i) => (
          <option key={i} value={list} className="capitalize">
            {list}
          </option>
        ))}
      </select>
    </>
  );
}

export function Button({
  text = "Button",
  type = "secondary",
  long = false,
  loading = false,
  ...rest
}) {
  const validTypes = ["primary", "secondary", "danger"];
  const isTypeExists = validTypes.includes(type);
  const styles =
    type === "secondary"
      ? "bg-dark-100 text-white-100"
      : type === "primary"
        ? "bg-blue-400 text-white-100"
        : type === "success"
          ? "bg-green-400 text-dark-100"
          : type === "danger"
            ? "bg-red-700 text-white-100"
            : "bg-dark-200 text-white-100";

  return (
    <button
      className={`px-5 py-2 ${isTypeExists ? styles : styles
        } font-extrabold rounded-md ${long ? "w-full" : ""} ${loading ? "opacity-[.5] cursor-not-allowed " : "opacity-1 cursor-pointer"}  `}
      {...rest}
      disabled={loading}
    >
      {text}
    </button>
  );
}

export function StatusState({ state = "pending", text = "Status" }) {
  return (
    <span
      className={`px-3 py-1 scale-[.60] rounded-[30px] text-[10px] font-extrabold ${state === "pending"
        ? "bg-green-400 text-dark-100"
        : state === "approved"
          ? "bg-dark-100 text-white-100"
          : state === "rejected"
            ? "bg-red-200 text-white-100"
            : "bg-red-200 text-white-100"
        }`}
    >
      {state === "pending"
        ? text
        : state === "approved"
          ? text
          : state === "rejected"
            ? text
            : "Invalid State"}
    </span>
  );
}

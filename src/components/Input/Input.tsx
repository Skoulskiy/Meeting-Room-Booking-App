import { useState, type InputHTMLAttributes } from "react"
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string,
  id: string
}


export const Input : React.FC<InputProps> = ({label, id, type="text", ...props}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordInput = type === 'password';
  const currentType = isPasswordInput ? (showPassword ? "text" : "password") : type;

  return (
    <div className="relative z-0 w-full group mb-2">
      <input 
        id={id}
        type={currentType}
        {...props}
        placeholder=" "
        className="
          peer block w-full appearance-none border-0 border-b-2
          border-gray-600 bg-transparent px-0 py-2.5 text-sm
          text-white focus:border-blue-500 focus:outline-none
          focus:ring-0 transition-colors pr-10
        "
      />

      <label 
        htmlFor={id} 
        className="
          pointer-events-none absolute top-3 z-10
          origin-[0] -translate-y-6 scale-75
          transform text-sm text-gray-400 duration-300
          peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100
          peer-focus:-translate-y-6 peer-focus:scale-75
          peer-focus:text-blue-500 peer-focus:font-medium"
      >
          {label}
      </label>

      {isPasswordInput && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-0 top-2.5 text-gray-400 hover:text-white transition-colors focus:outline-none"
        >
          {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
        </button>
      )}
    </div>
  );
}
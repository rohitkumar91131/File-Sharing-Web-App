
type ButtonProps = {
    label : string;
    onClick : () => void;
}

export default function Button({label , onClick} : ButtonProps) {
  return (
    <div>
      <button onClick={onClick}>
        {label}
      </button>
    </div>
  )
}

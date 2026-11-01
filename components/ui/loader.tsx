import { cn } from "@/lib/utils"; // یا مسیر فایل cn خودتان
import styled from "styled-components";

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  loading?: boolean;
  size?: "sm" | "md" | "lg" | string; // قابلیت پذیرش سایزهای پیش‌فرض یا کلاس دلخواه Tailwind مثل w-12 h-12
}

const Loader = ({ loading = true, size = "md", className, ...props }: LoaderProps) => {
  if (!loading) return null;

  return (
    <StyledWrapper
      className={cn(
        "loader inline-flex items-center justify-center",
        {
          "text-sm": size === "sm", // تغییر ابعاد از طریق font-size به دلیل استفاده از em
          "text-base": size === "md",
          "text-2xl": size === "lg",
        },
        typeof size === "string" && !["sm", "md", "lg"].includes(size) ? size : undefined,
        className,
      )}
      {...props}
    >
      <svg viewBox="25 25 50 50">
        <circle r={20} cy={50} cx={50} />
      </svg>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  /* با استفاده از em، اندازه svg به طور کامل از font-size عنصر والد ارث‌بری می‌کند */
  width: 2em;
  height: 2em;

  svg {
    width: 100%;
    height: 100%;
    transform-origin: center;
    animation: rotate4 2s linear infinite;
  }

  circle {
    fill: none;
    stroke: hsl(214, 97%, 59%);
    stroke-width: 4; /* ضخامت متناسب با سایز */
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
    stroke-linecap: round;
    animation: dash4 1.5s ease-in-out infinite;
  }

  @keyframes rotate4 {
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes dash4 {
    0% {
      stroke-dasharray: 1, 200;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 90, 200;
      stroke-dashoffset: -35px;
    }
    100% {
      stroke-dashoffset: -125px;
    }
  }
`;

export default Loader;

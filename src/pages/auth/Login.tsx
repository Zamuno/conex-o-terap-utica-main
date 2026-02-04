import { LandingAuth } from "@/components/landing/LandingAuth";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Optional: Add a back to home link if desired, or just render LandingAuth which covers the full screen/centered content */}
      <div className="absolute top-4 left-4 z-10 lg:hidden">
        <Link to="/" className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            ψ
          </div>
        </Link>
      </div>
      <LandingAuth />
    </div>
  );
};

export default Login;

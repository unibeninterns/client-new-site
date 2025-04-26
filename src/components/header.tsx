import Image from "next/image";
import Link from "next/link";

const Header = () => {
    return (
        <>
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Link href={"https://drid.uniben.edu"} className="flex-shrink-0">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-purple-800 rounded-full flex items-center justify-center text-white font-bold text-xl">D</div>
              <span className="ml-2 font-semibold text-xl text-purple-800">DIRD</span>
            </div>
          </Link>
          <div className="ml-auto text-sm text-gray-600">
            Concept Note Submission
          </div>
        </div>
      </header>
        </>
    )
}

export default Header
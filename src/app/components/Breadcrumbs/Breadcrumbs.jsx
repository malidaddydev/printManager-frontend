import Link from "next/link";

const Breadcrumbs = ({ pageName }) => {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-[26px] font-bold leading-[30px] text-[#111928]">
        {pageName}
      </h2>

      <nav>
        <ol className="flex items-center gap-2">
          <li>
            <Link className="font-medium" href="/dashboard">
              Dashboard /
            </Link>
          </li>
          <li className="font-medium text-[#5750f1]">{pageName}</li>
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumbs;
import CfLogo from "@/components/common/logo";

const NotFound = () => {
  return (
    <div className="flex flex-col justify-center items-center gap-5 min-h-[60vh]">
      <CfLogo title="CardForge" className="h-36 w-36" />
      <h1 className="text-2xl font-bold text-red-500">404 - לא נמצא</h1>
      <p>העמוד שחיפשת לא קיים</p>
    </div>
  );
};

export default NotFound;

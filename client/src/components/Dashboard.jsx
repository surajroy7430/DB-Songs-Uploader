import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="text-center mt-10">
      <Link
        to="/upload-song"
        className="bg-amber-500 hover:bg-amber-600 px-10 py-3 rounded-full"
      >
        Upload Song
      </Link>
    </div>
  );
};

export default Dashboard;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Menu, X, Search } from 'lucide-react';
import AdminSidebar from "./AdminSideBar";
import { logoutUser } from "@/redux/slice/UserSlice";
import { useDispatch } from "react-redux";
import axiosInstance from "@/AxiosConfig";
import { Input } from "@/components/ui/input";
import Swal from "sweetalert2";

export default function StudentManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchStudents = async (page, search) => {
    try {
      const response = await axiosInstance.get("/admin/students", {
        params: { page, limit: 5, search },
        withCredentials: true,
      });
      setStudents(response.data.students);
      setTotalPages(response.data.totalPages);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching students:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  async function handleBlock(id) {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to block this student?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, block!",
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.put(`/admin/unlistuser/${id}`, {
          withCredentials: true,
        });
        fetchStudents(currentPage, searchTerm);
        dispatch(logoutUser());
        Swal.fire("Blocked!", "The student has been blocked.", "success");
      } catch (error) {
        console.error("Error blocking student:", error);
        Swal.fire("Error", "Failed to block the student.", "error");
      }
    }
  }

  async function handleUnblock(id) {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to unblock this student?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, unblock!",
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.put(`/admin/listuser/${id}`, {
          withCredentials: true,
        });
        fetchStudents(currentPage, searchTerm);
        Swal.fire("Unblocked!", "The student has been unblocked.", "success");
      } catch (error) {
        console.error("Error unblocking student:", error);
        Swal.fire("Error", "Failed to unblock the student.", "error");
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white shadow-md p-4 flex justify-between items-center md:hidden">
        <h1 className="text-xl font-bold">Student Management</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-600"
        >
          {sidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </header>

      <div className="flex flex-1">
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 p-4 md:p-8 overflow-x-auto">
          <h1 className="text-2xl font-bold mb-6 hidden md:block">Students</h1>

          <div className="mb-4 relative w-64">
            <Input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>

          {students.length === 0 ? (
            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No Students Found</h2>
              <p className="text-gray-600">There are currently no students registered in the system.</p>
            </div>
          ) : (
            <>
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full table-auto divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sl. No.
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student_ID
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student Name
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student Email
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Courses Purchased
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student, index) => (
                        <tr
                          key={student._id}
                          className="cursor-pointer hover:bg-gray-50"
                        >
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {index + 1 + (currentPage - 1) * 5}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {student.user_id}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {student.name}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {student.email}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {typeof student.coursePurchased === "number"
                              ? student.coursePurchased > 0
                                ? `${student.coursePurchased} Course${
                                    student.coursePurchased > 1 ? "s " : ""
                                  }`
                                : "No Courses"
                              : "No Courses"}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {student.isActive ? "Active" : "Inactive"}
                          </td>
                          <td className="px-4 py-2 text-sm font-medium">
                            <button
                              className={`w-24 px-6 py-2 rounded-md text-white transition duration-300 ${
                                student.isActive
                                  ? "bg-red-600 hover:bg-red-700"
                                  : "bg-blue-600 hover:bg-blue-700"
                              }`}
                              onClick={() =>
                                student.isActive
                                  ? handleBlock(student._id)
                                  : handleUnblock(student._id)
                              }
                            >
                              {student.isActive ? "Block" : "Unblock"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between mt-4 gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2 py-1 rounded bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50 text-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex flex-wrap gap-2">
                  {Array.from(
                    { length: totalPages },
                    (_, i) => i + 1
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-2 py-1 rounded text-sm ${
                        currentPage === page
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 rounded bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50 text-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}


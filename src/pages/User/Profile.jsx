import { useState } from 'react'
import { Pencil, Menu, Camera } from 'lucide-react'
import Sidebar from './Sidebar'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'sonner'
import { updateUser } from '@/redux/slice/UserSlice'
import axiosInstance from '@/AxiosConfig'
import CropperModal from '../../components/common/ProfileCropModal'

export default function Profile() {
  const dispatch = useDispatch()
  const userData = useSelector((store) => store.user.userDatas)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [editField, setEditField] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [showCropper, setShowCropper] = useState(false)
  const [cropperImage, setCropperImage] = useState('')
  const [validationError, setValidationError] = useState('')
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  
  const handleEdit = (field, value) => {
    setEditField(field)
    setEditValue(value)
    setValidationError('')
  }

  const validateField = (field, value) => {
    if (field === 'name') {
      return /^[a-zA-Z\s]*$/.test(value) ? null : 'Name must contain only letters and spaces'
    } else if (field === 'phone') {
      return /^\d{10}$/.test(value) ? null : 'Phone number must be exactly 10 digits'
    }
    return null
  }

  const handleUpdate = async (e) => {
    e.preventDefault()

    if (!editValue) {
      setValidationError('Field cannot be empty')
      return
    }

    const error = validateField(editField, editValue)
    if (error) {
      setValidationError(error)
      return
    }

    try {
      const updatedData = { ...userData, [editField]: editValue }
      console.log('Sending update request:', updatedData)
      const response = await axiosInstance.put('/user/update', updatedData)

      dispatch(updateUser(updatedData))
      setEditField(null)
      setEditValue('')
      setValidationError('')
      toast.success(response.data.message)
    } catch (err) {
      console.error('Update error:', err)
      const errorMessage = err.response?.data?.message || 'An error occurred'
      toast.error(errorMessage)
    }
  }

  const uploadImage = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'skillfinity_media')
    formData.append('cloud_name', 'dwxnxuuht')

    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/dwxnxuuht/image/upload', {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data.secure_url
    } catch (error) {
      console.error('Image upload error:', error.message || error)
      throw new Error('Failed to upload image. Please check your internet connection and try again.')
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Image validation
    const validTypes = ['image/jpeg', 'image/png', 'image/gif']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a JPEG, PNG, or GIF image.')
      return
    }

    if (file.size > maxSize) {
      toast.error('File is too large. Please upload an image smaller than 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setCropperImage(reader.result)
      setShowCropper(true)
    }
    reader.readAsDataURL(file)
  }

  const handleCroppedImage = async (blob) => {
    setIsUploading(true)
    setShowCropper(false)

    try {
      const imageUrl = await uploadImage(blob)
      const updatedUser = { ...userData, profileImage: imageUrl }
      await axiosInstance.put('/user/update', updatedUser)
      
      dispatch(updateUser(updatedUser))
      toast.success('Profile image updated successfully')
    } catch (error) {
      console.error('Image upload error:', error)
      toast.error('Failed to update profile image: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const fields = [
    { label: 'Name', value: userData.name, editable: true },
    { label: 'Phone', value: userData.phone, editable: true },
    { label: 'Email', value: userData.email, editable: false },
  ]

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm lg:hidden">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-500"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Profile</h1>
            <div className="bg-white shadow-lg rounded-lg max-w-3xl mx-auto overflow-hidden">
              <div className="px-6 py-8 sm:p-10 bg-gradient-to-r from-blue-800 to-gray-800">
                <h2 className="text-2xl font-semibold text-white mb-2">Profile Details</h2>
                <p className="text-pink-100">Manage your personal information</p>
              </div>
              <div className="px-6 py-8 sm:p-10">
                <div className="flex flex-col items-center mb-10">
                  <div className="relative">
                    <img
                      src={userData.profileImage || "/tutoravatar.png?height=150&width=150"}
                      alt="Profile"
                      className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <label
                      htmlFor="profile-image-upload"
                      className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 cursor-pointer"
                    >
                      <Camera className="h-6 w-6 text-gray-600" />
                      <input
                        id="profile-image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                    </label>
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-6">
                  {fields.map((field) => (
                    <div key={field.label} className="flex flex-col sm:flex-row sm:items-center justify-between">
                      <label htmlFor={field.label.toLowerCase()} className="text-lg font-medium text-gray-700 mb-2 sm:mb-0">
                        {field.label}:
                      </label>
                      <div className="relative w-full sm:w-2/3">
                        <input
                          id={field.label.toLowerCase()}
                          type="text"
                          value={field.value}
                          readOnly
                          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition duration-150 ease-in-out"
                        />
                        {field.editable && (
                          <button
                            onClick={() => handleEdit(field.label.toLowerCase(), field.value)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pink-500 transition duration-150 ease-in-out"
                            aria-label={`Edit ${field.label}`}
                          >
                            <Pencil className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      {editField && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl z-10">
            <h3 className="text-lg font-medium mb-4">Edit {editField}</h3>
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
            {validationError && (
              <p className="mt-2 text-sm text-red-600">{validationError}</p>
            )}
            <div className="mt-4 flex justify-end space-x-2">
              <button onClick={() => setEditField(null)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">Cancel</button>
              <button onClick={handleUpdate} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">Update</button>
            </div>
          </div>
        </div>
      )}
      {showCropper && (
        <CropperModal
          isOpen={showCropper}
          onClose={() => setShowCropper(false)}
          image={cropperImage}
          onCropComplete={handleCroppedImage}
        />
      )}
    </div>
  )
}


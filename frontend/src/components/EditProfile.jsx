import React, { useContext, useRef, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { userDataContext } from "../context/UserContext";
import dp from "../assets/dp.webp";
import { FiPlus } from "react-icons/fi";
import { FiCamera } from "react-icons/fi";
import axios from "axios";
import { authDataContext } from "../context/AuthContext";
const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Something went wrong";
function EditProfile() {
  let { setEdit, userData, setUserData } = useContext(userDataContext);
  let { serverUrl } = useContext(authDataContext);
  const safeUserData = {
    firstName: userData?.firstName ?? "",
    lastName: userData?.lastName ?? "",
    userName: userData?.userName ?? "",
    headline: userData?.headline ?? "",
    location: userData?.location ?? "",
    gender: userData?.gender ?? "",
    skills: Array.isArray(userData?.skills) ? userData.skills : [],
    education: Array.isArray(userData?.education) ? userData.education : [],
    experience: Array.isArray(userData?.experience) ? userData.experience : [],
    profileImage: userData?.profileImage ?? dp,
    coverImage: userData?.coverImage ?? null,
  };
  let [firstName, setFirstName] = useState(safeUserData.firstName);
  let [lastName, setLastName] = useState(safeUserData.lastName);
  let [userName, setUserName] = useState(safeUserData.userName);
  let [headline, setHeadline] = useState(safeUserData.headline);
  let [location, setLocation] = useState(safeUserData.location);
  let [gender, setGender] = useState(safeUserData.gender);
  let [skills, setSkills] = useState(safeUserData.skills);
  let [newSkills, setNewSkills] = useState("");
  let [education, setEducation] = useState(safeUserData.education);
  let [newEducation, setNewEducation] = useState({
    college: "",
    degree: "",
    fieldOfStudy: "",
  });
  let [experience, setExperience] = useState(safeUserData.experience);
  let [newExperience, setNewExperience] = useState({
    title: "",
    company: "",
    description: "",
  });

  let [frontendProfileImage, setFrontendProfileImage] = useState(
    userData.profileImage || dp
  );
  let [backendProfileImage, setBackendProfileImage] = useState(null);
  let [frontendCoverImage, setFrontendCoverImage] = useState(
    userData.coverImage || null
  );
  let [backendCoverImage, setBackendCoverImage] = useState(null);
  let [saving, setSaving] = useState(false);
  const profileImage = useRef();
  const coverImage = useRef();

  function addSkill(e) {
    e.preventDefault();
    const trimmedSkill = newSkills.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      setSkills([...skills, trimmedSkill]);
    }
    setNewSkills("");
  }

  function removeSkill(skill) {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    }
  }
  function addEducation(e) {
    e.preventDefault();
    if (
      newEducation.college &&
      newEducation.degree &&
      newEducation.fieldOfStudy
    ) {
      setEducation([...education, newEducation]);
    }
    setNewEducation({
      college: "",
      degree: "",
      fieldOfStudy: "",
    });
  }
  function addExperience(e) {
    e.preventDefault();
    if (
      newExperience.title &&
      newExperience.company &&
      newExperience.description
    ) {
      setExperience([...experience, newExperience]);
    }
    setNewExperience({
      title: "",
      company: "",
      description: "",
    });
  }
  function removeEducation(edu) {
    if (education.includes(edu)) {
      setEducation(education.filter((e) => e !== edu));
    }
  }
  function removeExperience(exp) {
    if (experience.includes(exp)) {
      setExperience(experience.filter((e) => e !== exp));
    }
  }

  function handleProfileImage(e) {
    const file = e.target.files[0];
    setBackendProfileImage(file);
    setFrontendProfileImage(URL.createObjectURL(file));
  }
  function handleCoverImage(e) {
    const file = e.target.files[0];
    setBackendCoverImage(file);
    setFrontendCoverImage(URL.createObjectURL(file));
  }

  const handleSaveProfile = async () => {
    if (saving) {
      return;
    }
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedUserName = userName.trim();
    const trimmedHeadline = headline.trim();
    const trimmedLocation = location.trim();

    if (!trimmedFirstName || !trimmedLastName || !trimmedUserName) {
      return;
    }

    setSaving(true);
    try {
      const formdata = new FormData();
      formdata.append("firstName", trimmedFirstName);
      formdata.append("lastName", trimmedLastName);
      formdata.append("userName", trimmedUserName);
      formdata.append("headline", trimmedHeadline);
      formdata.append("location", trimmedLocation);
      formdata.append("skills", JSON.stringify(skills));
      formdata.append("education", JSON.stringify(education));
      formdata.append("experience", JSON.stringify(experience));

      if (backendProfileImage) {
        formdata.append("profileImage", backendProfileImage);
      }
      if (backendCoverImage) {
        formdata.append("coverImage", backendCoverImage);
      }

      const result = await axios.put(
        `${serverUrl}/api/user/updateprofile`,
        formdata,
        { withCredentials: true }
      );
      setUserData(result.data ?? userData);
      setEdit(false);
    } catch (error) {
      console.error("Failed to update profile:", getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur">
      <input
        type="file"
        accept="image/*"
        hidden
        ref={profileImage}
        onChange={handleProfileImage}
      />
      <input
        type="file"
        accept="image/*"
        hidden
        ref={coverImage}
        onChange={handleCoverImage}
      />
      <div className="relative flex h-[92vh] w-[92%] max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Edit Profile
            </h2>
            <p className="text-sm font-medium text-slate-500">
              Update your information to keep your presence fresh.
            </p>
          </div>
          <button
            className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
            onClick={() => setEdit(false)}
          >
            <RxCross1 className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
          <div
            className="relative mb-16 h-36 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-sky-200 via-slate-200 to-white"
            onClick={() => coverImage.current?.click()}
          >
            {frontendCoverImage ? (
              <img
                src={frontendCoverImage}
                alt="Cover preview"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-500">
                Click to upload cover photo
              </div>
            )}
            <FiCamera className="absolute right-4 top-4 h-6 w-6 text-white drop-shadow" />
          </div>
          <div className="relative -mt-20 mb-8 flex items-center gap-4 pl-1">
            <button
              className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-lg transition hover:scale-[1.02]"
              onClick={() => profileImage.current?.click()}
            >
              <img
                src={frontendProfileImage}
                alt={`${firstName} ${lastName}`.trim() || "Profile preview"}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </button>
            <button
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-sky-200 hover:bg-sky-50"
              onClick={() => profileImage.current?.click()}
            >
              <FiPlus />
              Change avatar
            </button>
          </div>
          <div className="flex flex-col gap-4">
            <div className="grid gap-3 md:grid-cols-2">
              <input
                type="text"
                placeholder="First name"
                className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-600 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Last name"
                className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-600 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Username"
                className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-600 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Professional headline"
                className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-600 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
              />
              <input
                type="text"
                placeholder="Location"
                className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-600 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <input
                type="text"
                placeholder="Gender (optional)"
                className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-600 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h1 className="text-base font-semibold text-slate-900">
                  Skills
                </h1>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {skills.length} added
                </span>
              </div>
              {skills && skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600 shadow-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        className="text-slate-400 transition hover:text-red-500"
                        onClick={() => removeSkill(skill)}
                      >
                        <RxCross1 className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-3 flex flex-col gap-3 md:flex-row">
                <input
                  type="text"
                  placeholder="Add new skill"
                  value={newSkills}
                  onChange={(e) => setNewSkills(e.target.value)}
                  className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
                <button
                  className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600"
                  onClick={addSkill}
                >
                  Add
                </button>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h1 className="text-base font-semibold text-slate-900">
                  Education
                </h1>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {education.length} records
                </span>
              </div>
              {education && education.length > 0 && (
                <div className="flex flex-col gap-3">
                  {education.map((edu, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                    >
                      <div className="text-sm font-medium text-slate-600">
                        <div>
                          <span className="font-semibold text-slate-800">
                            College:
                          </span>{" "}
                          {edu.college}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800">
                            Degree:
                          </span>{" "}
                          {edu.degree}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800">
                            Field:
                          </span>{" "}
                          {edu.fieldOfStudy}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="text-slate-400 transition hover:text-red-500"
                        onClick={() => removeEducation(edu)}
                      >
                        <RxCross1 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <input
                  type="text"
                  placeholder="College"
                  value={newEducation.college}
                  onChange={(e) =>
                    setNewEducation({
                      ...newEducation,
                      college: e.target.value,
                    })
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
                <input
                  type="text"
                  placeholder="Degree"
                  value={newEducation.degree}
                  onChange={(e) =>
                    setNewEducation({ ...newEducation, degree: e.target.value })
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
                <input
                  type="text"
                  placeholder="Field of Study"
                  value={newEducation.fieldOfStudy}
                  onChange={(e) =>
                    setNewEducation({
                      ...newEducation,
                      fieldOfStudy: e.target.value,
                    })
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
              </div>
              <button
                className="mt-3 w-full rounded-full border border-sky-200 bg-white py-2 text-sm font-semibold text-sky-600 transition hover:bg-sky-50"
                onClick={addEducation}
              >
                Add education
              </button>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h1 className="text-base font-semibold text-slate-900">
                  Experience
                </h1>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {experience.length} roles
                </span>
              </div>
              {experience && experience.length > 0 && (
                <div className="flex flex-col gap-3">
                  {experience.map((exp, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                    >
                      <div className="text-sm font-medium text-slate-600">
                        <div>
                          <span className="font-semibold text-slate-800">
                            Title:
                          </span>{" "}
                          {exp.title}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800">
                            Company:
                          </span>{" "}
                          {exp.company}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800">
                            Description:
                          </span>{" "}
                          {exp.description}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="text-slate-400 transition hover:text-red-500"
                        onClick={() => removeExperience(exp)}
                      >
                        <RxCross1 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <input
                  type="text"
                  placeholder="Title"
                  value={newExperience.title}
                  onChange={(e) =>
                    setNewExperience({
                      ...newExperience,
                      title: e.target.value,
                    })
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
                <input
                  type="text"
                  placeholder="Company"
                  value={newExperience.company}
                  onChange={(e) =>
                    setNewExperience({
                      ...newExperience,
                      company: e.target.value,
                    })
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newExperience.description}
                  onChange={(e) =>
                    setNewExperience({
                      ...newExperience,
                      description: e.target.value,
                    })
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
              </div>
              <button
                className="mt-3 w-full rounded-full border border-sky-200 bg-white py-2 text-sm font-semibold text-sky-600 transition hover:bg-sky-50"
                onClick={addExperience}
              >
                Add experience
              </button>
            </div>

            <button
              className="mt-6 w-full rounded-full bg-sky-500 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600 disabled:opacity-70"
              disabled={saving}
              onClick={handleSaveProfile}
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;

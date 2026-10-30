import React from "react";
import ProjectForm from "@/components/admin/ProjectForm";
import PageHead from "@/components/admin/PageHead";

export default function NewProjectPage() {
  return (
    <>
      <PageHead title="Project baru" lede="Project yang disimpan langsung tampil di situs." />
      <ProjectForm isEdit={false} />
    </>
  );
}

import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ButtonGroupExample from "../../components/ui/buttons-group";
import PageMeta from "../../components/common/PageMeta";

export default function ButtonsGroup() {
  return (
    <div>
      <PageMeta
        title="React.js Buttons Group Dashboard | Business 4 Passion - React.js Admin Dashboard Template"
        description="This is React.js Buttons Group Dashboard page for Business 4 Passion - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Buttons Group" />
      <ButtonGroupExample />
    </div>
  );
}

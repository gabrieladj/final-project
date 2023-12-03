import { getAllCourseSections } from "@/lib/courseSection";
import { withSessionSsr } from "@/lib/session";
import './section-selector.css'
import Footer from "@/components/Footer";

export default function CourseSections(props) {
  const sections = props.sections;

  return (
    <div>
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow flex flex-col items-center justify-center text-center">
        <h1 className="text-5xl font-semibold mb-6">Humanitarianism Stat Tracker</h1>
          <h1 className="text-3xl font-semibold mb-6">Choose Your Class Section:</h1>
          <div className="space-y-4">
            {sections.map((section) => (
              <div key={section.id} className="text-center">
                <a href={`./class/${section.id}`}>
                  <button className="button-card px-8 py-4 text-xl font-semibold rounded-full bg-blue-500 text-black hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105">
                    {section.name}
                    <br />
                    {section.description}
                  </button>
                </a>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
      
    </div>
  );
}

export const getServerSideProps = withSessionSsr(async function ({ req, res }) {
  // Fetch quiz names from database
  const sections = await getAllCourseSections();

  return { props: { sections } };
});

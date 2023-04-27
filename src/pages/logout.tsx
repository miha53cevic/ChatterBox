import Loading from "../layouts/Loading";
import withSession from "../lib/withSession";

export const getServerSideProps = withSession(async ({ req }) => {
    req.session.destroy();
    return {
        redirect: { destination: '/', permanent: false }
    }
});

const Logout = () => {
    return <Loading />;
};

export default Logout;
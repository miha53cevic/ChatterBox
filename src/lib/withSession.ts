import { withIronSessionSsr } from "iron-session/next";
import { GetServerSideProps } from "next";
import ironOptions from "./ironOptions";

const withSession = (handler: GetServerSideProps) => withIronSessionSsr(handler, ironOptions);

export default withSession;
const association = {
  applinks: {
    apps: [],
    details: [
      {
        appID: "Q2265WCRMS.com.ajrkhll.lift",
        paths: ["/p/*"],
      },
    ],
  },
};

export function GET() {
  return Response.json(association);
}

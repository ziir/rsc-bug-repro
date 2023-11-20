export function ServerRoot({ createFlightResponse }) {
  const flightResponse = createFlightResponse();

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>RSC Bug Repro</title>
      </head>
      <body>
        <div id="root">{flightResponse}</div>
      </body>
    </html>
  );
}

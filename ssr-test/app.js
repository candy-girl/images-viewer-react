const React = require('react');
const Viewer = require('../dist/index').default;

function App () {
  const [ visible, setVisible ] = React.useState(false);

  const images = [
    {
      src:
        "https://infeng.github.io/react-viewers/59111ff2c38954887bc313887fe76e27.jpg"
    },
    {
      src:
        "https://infeng.github.io/react-viewers/bbbc41dac417d9fb4b275223a6a6d3e8.jpg"
    }
  ];

  return (
    <div>
      <button onClick={() => { setVisible(true); }}>{visible ? 'close' : 'open'}</button>
      <Viewer images={images} visible={visible} onClose={() => { setVisible(false); }} />
    </div>
  );
}

module.exports = App;

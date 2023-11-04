import { render, screen } from '@testing-library/react';
//import Main from '../src/pages/index';
import Test from '../src/app/test/page';
import '@testing-library/jest-dom';

 
describe('Home', () => {
  // it('renders a heading', () => {
  //   render(<Home />)
  //   expect(screen.getByText(`Humanitarianism Project`)).toBeInTheDocument()
  // });

  // it('renders the map', () => {
  //   render(<Map />)
  //   const mapImage = screen.getByAltText('Map'); // Use the 'name' attribute as the accessible name
  //   expect(mapImage).toBeInTheDocument();
  //   expect(mapImage).toHaveAttribute('src', '/Picture1.png');
  // });

  // it('Main component renders without errors', () => {
  //   render(<Main />);
  
  //   // Check if the canvas element is in the document
  //   const canvasElement = screen.getByTestId('canvas');
  //   expect(canvasElement).toBeInTheDocument();

    
  // });
  it('Test the test page', () => {
    render(<Test />);
    // Check if the canvas element is in the document
    const testElement = screen.getByTestId('test');
    expect(testElement).toBeInTheDocument();
  });
});
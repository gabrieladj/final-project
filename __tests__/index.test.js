import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Main from '../src/pages/index';
import Test from '../src/app/test/page';
import '@testing-library/jest-dom';
import { getCampStats } from '@/lib/stats';
import { getCampCapacity } from '@/lib/utility';


describe('Home', () => {
  // it('renders a heading', () => {
  //   render(<Home />)
  //   expect(screen.getByText(`Humanitarianism Project`)).toBeInTheDocument()
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

// describe('Tests the side panel', () => {
//   it('checks if the side panel is open', async () => {
//     render(<Main />);
//     // Check if the side panel is initially open
//       const togglePanel = screen.getByText('Toggle Panel');
//       expect(screen.getByTestId('side-panel')).toHaveClass('open');
//   });
// });

// describe('getCampStats', () => {
//   it('should return an array of camp stats', async () => {
//     const stats = await getCampStats();
    
//     expect(Array.isArray(stats)).toBe(true);
//     stats.forEach(camp => {
//       expect(camp).toHaveProperty('id');
//       expect(camp).toHaveProperty('foodLevel');
//       expect(camp).toHaveProperty('housingLevel');
//       expect(camp).toHaveProperty('administrationLevel');
//       expect(camp).toHaveProperty('healthcareLevel');
//     });
//   });
// });

describe('getCampCapacity', () => {
  it('should the capacity based on ratio defined in the function', async () => {
    const capacity = getCampCapacity(10, 10, 10, 10);
    expect(capacity).toBe(10);
  });
});
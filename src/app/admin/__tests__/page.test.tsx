import {
  render,
  screen,
  act,
  waitFor,
  fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminPage from "../page";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("AdminPage", () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    // Mock fetch to return empty array initially
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([]),
      })
    ) as jest.Mock;

    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("adds a new timeslot and refreshes the list", async () => {
    const user = userEvent.setup();
    const today = new Date().toISOString().split("T")[0];
    const mockTimeslot = {
      id: "1",
      date: today,
      startTime: `${today}T10:00:00`,
      endTime: `${today}T12:00:00`,
      location: "Test Location",
      signups: [],
    };

    // Mock fetch responses
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({ json: () => Promise.resolve([]) })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({ json: () => Promise.resolve(mockTimeslot) })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({ json: () => Promise.resolve([mockTimeslot]) })
      );

    render(<AdminPage />);

    // Fill out the form
    const locationInput = screen.getByLabelText("Location");
    const timeSlider = screen.getByRole("slider");
    const submitButton = screen.getByRole("button", { name: /add time slot/i });

    await act(async () => {
      await user.type(locationInput, "Test Location");
      // Set slider to 10 AM - 12 PM
      fireEvent.change(timeSlider, { target: { value: [10, 12] } });
      await user.click(submitButton);
    });

    // Verify the timeslot appears in the list
    await waitFor(async () => {
      expect(screen.getByText("Test Location")).toBeInTheDocument();
      expect(screen.getByText(/10:00.*12:00/)).toBeInTheDocument();

      // Verify the API was called correctly
      expect(global.fetch).toHaveBeenCalledWith("/api/timeslots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: today,
          startTime: `${today}T10:00`,
          endTime: `${today}T12:00`,
          location: "Test Location",
        }),
      });
    });
  });

  it("logs out and redirects to home page", async () => {
    const user = userEvent.setup();
    render(<AdminPage />);

    const logoutButton = screen.getByRole("button", { name: /logout/i });
    await user.click(logoutButton);

    expect(localStorage.getItem("myName")).toBeNull();
    expect(mockRouter.push).toHaveBeenCalledWith("/");
  });
});

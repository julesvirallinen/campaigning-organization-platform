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
      note: "Test Note",
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
    const noteInput = screen.getByLabelText(/note/i);
    const timeSliders = screen.getAllByRole("slider");
    const submitButton = screen.getByRole("button", { name: /add time slot/i });

    await act(async () => {
      await user.type(locationInput, "Test Location");
      await user.type(noteInput, "Test Note");
      // Set start time to 10 AM
      fireEvent.change(timeSliders[0], { target: { value: "10" } });
      // Set end time to 12 PM
      fireEvent.change(timeSliders[1], { target: { value: "12" } });
      await user.click(submitButton);
    });

    // Verify the timeslot appears in the list
    await waitFor(async () => {
      expect(screen.getByText("Test Location")).toBeInTheDocument();
      expect(screen.getByText(/10:00.*12:00/)).toBeInTheDocument();
      expect(
        screen.getByText("Description:", { exact: false })
      ).toBeInTheDocument();
      expect(screen.getByText("Test Note")).toBeInTheDocument();

      // Verify the API was called correctly
      expect(global.fetch).toHaveBeenCalledWith("/api/timeslots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: today,
          startTime: `${today}T10:00`,
          endTime: `${today}T12:00`,
          location: "Test Location",
          note: "Test Note",
        }),
      });
    });
  });

  it("creates timeslot with default time range", async () => {
    const user = userEvent.setup();
    const today = new Date().toISOString().split("T")[0];
    const mockTimeslot = {
      id: "1",
      date: today,
      startTime: `${today}T09:00:00`,
      endTime: `${today}T17:00:00`,
      location: "Default Time Location",
      signups: [],
    };

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

    const locationInput = screen.getByLabelText("Location");
    const submitButton = screen.getByRole("button", { name: /add time slot/i });

    await act(async () => {
      await user.type(locationInput, "Default Time Location");
      await user.click(submitButton);
    });

    await waitFor(async () => {
      expect(screen.getByText("Default Time Location")).toBeInTheDocument();
      expect(screen.getByText(/9:00.*5:00/)).toBeInTheDocument();

      expect(global.fetch).toHaveBeenCalledWith("/api/timeslots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: today,
          startTime: `${today}T09:00`,
          endTime: `${today}T17:00`,
          location: "Default Time Location",
          note: "",
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

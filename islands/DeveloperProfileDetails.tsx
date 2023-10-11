import { ComponentChild } from "preact";
import { useSignal } from "@preact/signals";
import { useState } from "preact/hooks";
import { DeveloperStatus } from "@/types/DeveloperStatus.ts";
import { ExpiringUUID } from "@/types/ExpiringUUID.ts";
import { Developer } from "@/types/Developer.ts";
import { CSRFInput } from "@/components/CRSFInput.tsx";
import { TargetedEvent } from "preact/compat/src/index.js";

interface RowProps {
  title: string;
  children: ComponentChild;
}

function Row(props: RowProps) {
  return (
    <div>
      <div style="display:inline-block; margin-right:1em;">
        <strong>{props.title}</strong>
      </div>
      {props.children}
    </div>
  );
}

export default function DeveloperProfileDetails(
  { csrfToken, developer }: { csrfToken: ExpiringUUID; developer: Developer },
) {
  const isEditing = useSignal(false);
  const isSaving = useSignal(false);
  const [fullName, setFullName] = useState(developer.name || "");
  const [location, setLocation] = useState(developer.location || "");
  const [bio, setBio] = useState(developer.bio || "");
  const [availableToWorkStartDate, setAvailableToWorkStartDate] = useState<
    string | undefined
  >(
    developer.availableToWorkStartDate ?? undefined,
  );
  const [status, setStatus] = useState(
    developer.status,
  );
  const [openToFullTime, setOpenToFullTime] = useState(
    developer.openToFullTime,
  );
  const [openToPartTime, setOpenToPartTime] = useState(
    developer.openToPartTime,
  );
  const [openToContract, setOpenToContract] = useState(
    developer.openToContract,
  );

  const workTypes: string[] = [];

  if (openToFullTime) workTypes.push("Full-time");
  if (openToPartTime) workTypes.push("Part-time");
  if (openToContract) workTypes.push("Contract");

  const openTo = workTypes.length ? workTypes.join(", ") : "N/A";

  function handleEditClick(e: MouseEvent) {
    e.preventDefault();
    isEditing.value = true;
  }

  function handleSaveClick() {
    isSaving.value = true;
  }

  function handleCancelClick() {
    isEditing.value = false;
    setFullName(developer.name || "");
    setLocation(developer.location || "");
    setBio(developer.bio || "");
  }

  function handleInputFullName(e: TargetedEvent<HTMLInputElement>) {
    setFullName(e.currentTarget.value);
  }

  function handleInputLocation(e: TargetedEvent<HTMLInputElement>) {
    setLocation(e.currentTarget.value);
  }

  function handleInputBio(e: TargetedEvent<HTMLTextAreaElement>) {
    setBio(e.currentTarget.value);
  }

  function handleInputAvailableToWorkStartDate(
    e: TargetedEvent<HTMLInputElement>,
  ) {
    setAvailableToWorkStartDate(e.currentTarget.value);
  }

  return (
    <form method="post">
      <CSRFInput csrfToken={csrfToken} />
      <Row title="Name">
        {isEditing.value
          ? (
            <input
              maxLength={250}
              name="fullName"
              onInput={handleInputFullName}
              placeholder={"Your full name"}
              required
              type="text"
              value={fullName}
            />
          )
          : (developer.name || "N/A")}
      </Row>
      <Row title="Location">
        {isEditing.value
          ? (
            <input
              maxLength={250}
              name="location"
              onInput={handleInputLocation}
              placeholder={"Your location"}
              type="text"
              value={location}
            />
          )
          : (developer.location || "N/A")}
      </Row>
      <Row title="Bio">
        {isEditing.value
          ? (
            <textarea
              maxLength={2000}
              name="bio"
              onInput={handleInputBio}
              placeholder={"Your bio"}
              value={bio}
            />
          )
          : (developer.bio || "N/A")}
      </Row>
      <Row title="Available starting">
        <input
          disabled={!isEditing.value}
          name="availableToWorkStartDate"
          onInput={handleInputAvailableToWorkStartDate}
          type="date"
          value={availableToWorkStartDate}
        />
      </Row>
      <Row title="Status">
        <select
          disabled={!isEditing.value}
          name="status"
          required
          value={status ?? undefined}
        >
          <option />
          <option value={DeveloperStatus.ActivelyLooking}>
            Actively looking
          </option>
          <option value={DeveloperStatus.OpenToOpportunities}>
            Open to opportunities
          </option>
          <option value={DeveloperStatus.DoNotDisturb}>Do not disturb</option>
        </select>
      </Row>
      <Row title="Open to">
        {isEditing.value
          ? (
            <ul>
              <li>
                <label>
                  <input
                    checked={openToFullTime}
                    name="openToFullTime"
                    onChange={() => setOpenToFullTime(!openToFullTime)}
                    type="checkbox"
                  />{" "}
                  Full-time
                </label>
              </li>
              <li>
                <label>
                  <input
                    checked={openToPartTime}
                    name="openToPartTime"
                    onChange={() => setOpenToPartTime(!openToPartTime)}
                    type="checkbox"
                  />{" "}
                  Part-time
                </label>
              </li>
              <li>
                <label>
                  <input
                    checked={openToContract}
                    name="openToContract"
                    onChange={() => setOpenToContract(!openToContract)}
                    type="checkbox"
                  />{" "}
                  Contract
                </label>
              </li>
            </ul>
          )
          : (openTo || "N/A")}
      </Row>
      {!isEditing.value && (
        <button
          onClick={handleEditClick}
        >
          Edit
        </button>
      )}
      {isEditing.value && (
        <>
          <button
            onClick={handleSaveClick}
            type="submit"
          >
            Save
          </button>
          <button
            onClick={handleCancelClick}
          >
            Cancel
          </button>
        </>
      )}
    </form>
  );
}

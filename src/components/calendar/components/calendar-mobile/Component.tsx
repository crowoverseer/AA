import React, { forwardRef, useMemo, useState } from "react";
import mergeRefs from "react-merge-refs";
import { Virtuoso } from "react-virtuoso";
import { ResizeObserver as ResizeObserverPolyfill } from "@juggle/resize-observer";
import endOfDay from "date-fns/endOfDay";
import isSameMonth from "date-fns/isSameMonth";
import startOfDay from "date-fns/startOfDay";
import startOfMonth from "date-fns/startOfMonth";
import { ButtonMobile } from "@alfalab/core-components-button/mobile";
import { ModalMobile } from "@alfalab/core-components-modal/mobile";

import { DayAddons, Month, SelectorView, View } from "../../typings";
import { useCalendar } from "../../useCalendar";
import {
	addonArrayToHashTable,
	dateArrayToHashTable,
	generateMonths,
	generateWeeks,
	limitDate,
	monthName,
	WEEKDAYS,
} from "../../utils";
import { DaysTable } from "../days-table";

import styles from "./index.module.css";

// ResizeObserverPolyfill необходим для корректной работы react-virtuoso.
if (typeof window !== "undefined" && !window.ResizeObserver) {
	window.ResizeObserver = ResizeObserverPolyfill;
}

export type CalendarMobileProps = {
	headerSlot?: React.ReactNode;
	/**
	 * Дополнительный класс
	 */
	className?: string;

	/**
	 * Дополнительный класс шапки десктопного календаря
	 */
	headerClassName?: string;

	/**
	 * Дополнительный класс контента десктопного календаря
	 */
	contentClassName?: string;

	/**
	 * Вид по умолчанию (выбор дней, месяцев, лет)
	 */
	defaultView?: View;

	/**
	 * Вид шапки — месяц и год или только месяц
	 */
	selectorView?: SelectorView;

	/**
	 * Выбранная дата (timestamp)
	 */
	value?: number;

	/**
	 * Открытый месяц (timestamp)
	 */
	month?: number;

	/**
	 * Месяц, открытый по умолчанию (timestamp)
	 */
	defaultMonth?: number;

	/**
	 * Минимальная дата, доступная для выбора (timestamp)
	 */
	minDate?: number;

	/**
	 * Максимальная дата, доступная для выбора (timestamp)
	 */
	maxDate?: number;

	/**
	 * Начало выделенного периода (timestamp)
	 */
	selectedFrom?: number;

	/**
	 * Конец выделенного периода (timestamp)
	 */
	selectedTo?: number;

	/**
	 * Индикатор, что выбран полный период
	 */
	rangeComplete?: boolean;

	/**
	 * Список событий
	 */
	events?: Array<Date | number>;

	/**
	 * Список отключенных для выбора дней.
	 */
	offDays?: Array<Date | number>;

	/**
	 * Список выходных
	 */
	holidays?: Array<Date | number>;

	/**
	 * Обработчик изменения месяца (или года)
	 */
	onMonthChange?: (month: number) => void;

	/**
	 * Обработчик выбора даты
	 */
	onChange?: (date?: number) => void;

	/**
	 * Обработчик нажатия на кнопку месяца
	 */
	onMonthClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

	/**
	 * Обработчик нажатия на кнопку года
	 */
	onYearClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

	/**
	 * Обработчик нажатия на период
	 */
	onPeriodClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;

	/**
	 * Идентификатор для систем автоматизированного тестирования
	 */
	dataTestId?: string;

	/**
	 * Должен ли календарь подстраиваться под ширину родителя.
	 */
	responsive?: boolean;

	/**
	 * Дополнительный контент под числом
	 */
	dayAddons?: DayAddons[];

	/**
	 * Форма ячейки дня
	 */
	shape?: "rounded" | "rectangular";

	/**
	 * Отображать ли текущий год, если selectorView 'month-only'
	 * @default false
	 */
	showCurrentYearSelector?: boolean;
	/**
	 * Управление видимостью модалки
	 */
	open: boolean;

	/**
	 * Заголовок календаря
	 */
	title?: string;

	/**
	 * Обработчик закрытия модалки
	 */
	onClose?: () => void;

	/**
	 * Обработчик клика на название месяца в мобильном календаре
	 */
	onMonthTitleClick?: (event: React.MouseEvent<HTMLSpanElement>) => void;

	/**
	 * Количество лет для генерации в обе стороны от текущего года
	 */
	yearsAmount?: number;

	/**
	 * Разрешить выбор из недозаполненного диапазона дат.
	 */
	allowSelectionFromEmptyRange?: boolean;
};

const CalendarMonthOnlyView = ({
	value,
	defaultView,
	month: monthTimestamp,
	minDate: minDateTimestamp,
	maxDate: maxDateTimestamp,
	defaultMonth: defaultMonthTimestamp,
	offDays,
	events,
	holidays,
	onChange,
	onMonthTitleClick,
	selectedFrom,
	selectedTo,
	rangeComplete,
	onMonthChange,
	yearsAmount = 3,
	dayAddons,
	shape = "rounded",
	scrollableContainer,
}: CalendarMobileProps & {
	scrollableContainer?: HTMLElement;
}) => {
	const month = useMemo(
		() => (monthTimestamp ? new Date(monthTimestamp) : undefined),
		[monthTimestamp],
	);

	const minDate = useMemo(
		() => (minDateTimestamp ? startOfDay(minDateTimestamp) : undefined),
		[minDateTimestamp],
	);

	const maxDate = useMemo(
		() => (maxDateTimestamp ? endOfDay(maxDateTimestamp) : undefined),
		[maxDateTimestamp],
	);

	const selected = useMemo(
		() => (value ? new Date(value) : undefined),
		[value],
	);

	const defaultMonth = useMemo(
		() =>
			startOfMonth(
				selected ||
					limitDate(
						defaultMonthTimestamp || Date.now(),
						minDateTimestamp,
						maxDateTimestamp,
					),
			),
		[defaultMonthTimestamp, maxDateTimestamp, minDateTimestamp, selected],
	);

	const { activeMonth, highlighted, getDayProps } = useCalendar({
		month,
		defaultMonth,
		view: defaultView,
		minDate,
		maxDate,
		selected,
		offDays,
		events,
		onChange,
		onMonthChange,
		dayAddons,
	});

	const activeMonths = useMemo(() => {
		const eventsMap = dateArrayToHashTable(events || []);
		const offDaysMap = dateArrayToHashTable(offDays || []);
		const holidaysMap = dateArrayToHashTable(holidays || []);
		const dayAddonsMap = addonArrayToHashTable(dayAddons || []);

		const nextMonths: Month[] = [];

		const date = new Date();
		const currentYear = date.getFullYear();
		const currYearMonths = generateMonths(date, {
			startMonth: new Date().getMonth(),
		});

		for (let i = 0; i < yearsAmount; i++) {
			const nextYear = date.setFullYear(currentYear + (i + 1));

			const nextYearMonths = generateMonths(new Date(nextYear), {});

			nextMonths.push(...nextYearMonths);
		}

		const generatedMonths = [...currYearMonths, ...nextMonths];

		return generatedMonths.map((item) => ({
			...item,
			weeks: generateWeeks(item.date, {
				minDate,
				maxDate,
				selected,
				eventsMap,
				offDaysMap,
				holidaysMap,
				dayAddonsMap,
			}),
			title: `${monthName(item.date)} ${item.date.getFullYear()}`,
		}));
	}, [
		events,
		offDays,
		holidays,
		dayAddons,
		yearsAmount,
		minDate,
		maxDate,
		selected,
	]);

	const initialMonthIndex = useMemo(() => {
		const date = value || selectedFrom || Date.now();

		return activeMonths.findIndex((m) => isSameMonth(date, m.date));
	}, [activeMonths, selectedFrom, value]);

	const renderMonth = (index: number) => (
		<div className={styles.daysTable} id={`month-${index}`}>
			{onMonthTitleClick ? (
				/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */
				// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
				<span
					className={styles.month}
					onClick={onMonthTitleClick}
					tabIndex={0}
					role="button"
				>
					{activeMonths[index].title}
				</span>
			) : (
				<span className={styles.month}> {activeMonths[index].title} </span>
			)}
			<DaysTable
				weeks={activeMonths[index].weeks}
				activeMonth={activeMonth}
				selectedFrom={selectedFrom}
				selectedTo={selectedTo}
				getDayProps={getDayProps}
				highlighted={highlighted}
				rangeComplete={rangeComplete}
				hasHeader={false}
				responsive={true}
				shape={shape}
			/>
		</div>
	);

	return (
		<Virtuoso
			totalCount={activeMonths.length}
			itemContent={renderMonth}
			initialTopMostItemIndex={{
				index: initialMonthIndex ?? 0,
				align: "center",
			}}
			increaseViewportBy={500}
			itemSize={(el) => el.getBoundingClientRect().height + 32}
			customScrollParent={scrollableContainer}
			useWindowScroll={true}
		/>
	);
};

export const CalendarMobile = forwardRef<HTMLDivElement, CalendarMobileProps>(
	(
		{
			allowSelectionFromEmptyRange = false,
			className,
			value,
			selectedFrom,
			selectedTo,
			onChange,
			onMonthTitleClick,
			dataTestId,
			open,
			onClose,
			yearsAmount = 3,
			headerSlot,
			...restProps
		},
		ref,
	) => {
		const [modalRef, setModalRef] = useState<HTMLElement>();

		const handleClose = () => {
			if (onClose) onClose();
		};

		const handleClear = () => {
			if (onChange) onChange();
		};

		const renderDayNames = () => (
			<table className={styles.dayNames}>
				<thead>
					<tr>
						{WEEKDAYS.map((dayName) => (
							<th className={styles.dayName} key={dayName}>
								{dayName}
							</th>
						))}
					</tr>
				</thead>
			</table>
		);

		const renderContent = () => {
			const commonProps = {
				value,
				onChange,
				selectedFrom,
				selectedTo,
			};

			return (
				<CalendarMonthOnlyView
					open={open}
					yearsAmount={yearsAmount}
					scrollableContainer={modalRef}
					onMonthTitleClick={onMonthTitleClick}
					{...commonProps}
					{...restProps}
				/>
			);
		};

		const renderFooter = () => {
			if (selectedFrom || selectedTo) {
				let selectButtonDisabled = !selectedFrom || !selectedTo;

				if (allowSelectionFromEmptyRange) {
					selectButtonDisabled = !selectedFrom;
				}

				return (
					<React.Fragment>
						<ButtonMobile
							view="secondary"
							size="m"
							block={true}
							onClick={handleClear}
						>
							Сбросить
						</ButtonMobile>
						<ButtonMobile
							view="primary"
							size="m"
							block={true}
							onClick={handleClose}
							disabled={selectButtonDisabled}
						>
							Выбрать
						</ButtonMobile>
					</React.Fragment>
				);
			}

			if (value) {
				return (
					<ButtonMobile
						view="primary"
						size="m"
						block={true}
						onClick={handleClose}
					>
						Выбрать
					</ButtonMobile>
				);
			}

			return (
				<ButtonMobile
					view="secondary"
					size="m"
					block={true}
					onClick={handleClose}
				>
					Отмена
				</ButtonMobile>
			);
		};

		return (
			<ModalMobile
				open={open}
				onClose={handleClose}
				ref={mergeRefs([(node: HTMLDivElement) => setModalRef(node), ref])}
				className={className}
				wrapperClassName={styles.wrapper}
				transitionProps={{
					timeout: 0,
				}}
				backdropProps={{
					timeout: 0,
				}}
			>
				<ModalMobile.Header
					hasCloser={false}
					sticky={true}
					bottomAddons={renderDayNames()}
				>
					{headerSlot}
				</ModalMobile.Header>
				<ModalMobile.Content flex={true}>{renderContent()}</ModalMobile.Content>
				<ModalMobile.Footer sticky={true}>{renderFooter()}</ModalMobile.Footer>
			</ModalMobile>
		);
	},
);

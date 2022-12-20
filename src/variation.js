import { createHigherOrderComponent } from '@wordpress/compose';
import {
	InspectorControls,
	useBlockProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { isBlobURL } from '@wordpress/blob';
import { store as noticesStore } from '@wordpress/notices';
import { __ } from '@wordpress/i18n';
import { useEffect, useRef, useState } from '@wordpress/element';

const ALLOW_SVG = [ 'image/svg+xml' ];

/**
 * infiniteLoop block Editor scripts
 */
export const svgImgEdit = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		const {
			attributes,
			setAttributes,
			onSelectImage,
			isSelected,
			context,
			reference,
			forwardedRef,
			clientId,
		} = props;

		if ( attributes.className !== 'oh-my-imgsvg' || ! isSelected ) {
			return <BlockEdit { ...props } />;
		}

		const {
			url = '',
			alt,
			caption,
			align,
			id,
			href,
			rel,
			linkClass,
			linkDestination,
			title,
			width,
			height,
			linkTarget,
			sizeSlug,
		} = attributes;

		const { createErrorNotice, createSuccessNotice } =
			useDispatch( noticesStore );

		function useClientWidth( clientRef, dependencies ) {
			const [ clientWidth, setClientWidth ] = useState();

			function calculateClientWidth() {
				setClientWidth( clientRef.current?.clientWidth );
			}

			useEffect( calculateClientWidth, dependencies );
			useEffect( () => {
				const { defaultView } = clientRef.current.ownerDocument;

				defaultView.addEventListener( 'resize', calculateClientWidth );

				return () => {
					defaultView.removeEventListener(
						'resize',
						calculateClientWidth
					);
				};
			}, [] );

			return clientWidth;
		}

		const [ externalBlob, setExternalBlob ] = useState();

		const { imageSizes, maxWidth, mediaUpload } = useSelect(
			( select ) => {
				const { getSettings } = select( blockEditorStore );

				const settings = Object.fromEntries(
					Object.entries( getSettings() ).filter( ( [ key ] ) =>
						[
							'imageEditing',
							'imageDimensions',
							'imageSizes',
							'maxWidth',
							'mediaUpload',
						].includes( key )
					)
				);

				return { ...settings };
			},
			[ clientId ]
		);

		const updateImage = ( newSizeSlug ) => {
			console.log( newSizeSlug );

			console.log( imageSizes, maxWidth );
		};

		const uploadExternal = () => {
			mediaUpload( {
				filesList: [ externalBlob ],
				onFileChange( [ img ] ) {
					onSelectImage( img );

					if ( isBlobURL( img.url ) ) {
						return;
					}

					setExternalBlob();
					createSuccessNotice( __( 'Image uploaded.' ), {
						type: 'snackbar',
					} );
				},
				allowedTypes: ALLOW_SVG,
				onError( message ) {
					createErrorNotice( message, { type: 'snackbar' } );
				},
			} );
		};

		const IMGSVG = () => (
			// Disable reason: Image itself is not meant to be interactive, but
			// should direct focus to block.
			<>
				<img
					{ ...attributes }
					id="image"
					src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAADICAYAAAAeGRPoAAAqKUlEQVR4AezdBY7jdhiG8S9x4pAT/wvLzLw7M2VmbpdZvKJWsLyiHmFF7RUqLh+jFyjdYoXl9pX0VYqs2EuOJ548j/QribWN33HGYFOIiIiIiIiIiIiIiIiIiOjPXz9tSss1rHYREREx5j0JGV0jIiKi2ox5V0KO2IiIiKgWg55KyDEyIqK69cVP37ek69pWs+58djuSviQykNiIisc8klDEliu+NRlJ8L/3pWFEdE9j3peQkUijJmMeS5igb0TFF8Ix6LP1Z5LkfVtyl1EnIj8jDzmSGox5Q1IJOWIjysmHIuQYWJXxZxFLKNA3Iioc9FRCgeaMD3pbQoHEiIq/dk8lZKTStMoi/2o9FEiNiPLz0S7SmvFB7zLoVMJX730ZuT5jPhtft2fZQ0XEoEczPugtCQX6RqV25/Pbbem6tk054hZCNzSq9YGjIR1JXFcaRtO6IC5rVJOL4oYScrSszPg8pvKoPDJmyOeygrjrILZax8FjKCEjlcjKikFvyEhCRipRjW5Zy456KrFRafnnb+2YNWOGRjS9C+P6Vus4ePQl5Eis7Bj1riSuJ02rWX6BXFdiaVjZ8ZncPGbTmI2y3ojKu6ahK4n0pGVU7/xMPBSodnCI+EzulB1jto8zIiqIr/eKtKzKiPhM7nN7x+xxO21Zoq9++D2WrmvZDEYcPEYSCjSssojIv1o/lHHQbbCqY8gbMpSQMbBZisivaA85elZ1RHwmI9knS27R7ZXIqo5BTyTk6BlRDS6MGyzr2TkRn8vHZbtsk8dtOWLMmxIKpEZlXjjclJ4k0pfIHjjOCrouspUSt6akEiQxIrrfQW9JKGJlxZi3JS24rZdobsd8lWyXHbLTbZb2nP7AmshaSYzo3gc94gy9mlt6s2POqHPhSlcS15XGHL/ZarfbI3tln+yXrXM25D05JAtj9pd0fQjxO/S+lRGDHksowAWIxlWow3kcdT8zPyAH3SE5LEdcPCdjHo+NedYhiWwq8ZjjFXiWnnJ8WZ7XS7vEaD7ys3F+gvbGxntBFmXJPSFPynBOBn2VLBRYZWXFAXkg++UZ97TskmgFnTR0JJGBdKofc87Qia/E0jkc9H1j4/2UPC3PuGdlMEePUF0osNbKiINxS56TF+UF97z/t8NG9BC/Q3ctI2PQZQ4HfYMP93PueXnBLczR78/XVjLoHIw3yavuFfeyvOTWGNHd/z+KckY9Npqf/CuwII6nOflZ+ovykrwsr/igJ3N2ZftCgdjKiAPxEXnTvSGvu9d85Lca3XucqcfSlY40jbhX1KUSzfGta2tlryzKRmlZpjn+2n2DlRUH4SV5V95xb8tb8qbbbkRE9znqQwku8TEnHpr0qOx02yS1MmPQt8kH8r57z73rNhgRERHV4glfb8pR+ch96CP/khEREVF97j2XF+W4HHOL0raVGhERERERERHxBrjYNY2IiIhqN+Y9CRldI6L7ulI6lf2yKEuyU/pGRFTNmLcl5IiNiO5pzB+TJXlSnpKn5Rn/54ERES3vEzFHRkR3z8f8/xF/Vp6XF+RF2W9ERDP/iGsixnw0YcRfkpflFXnViO5+MF4lG2WVEXGGTv5Wo660jKoa9HTSiMtr8rq8YTTtR9iO5C056RakU6MhvyhXxly832En8qvaQ46OUa3eQjOUMGYkkVEVo/5CdsTlTXlLFoymOear5GO5knFx1kfd35n9iVyd4JJ0jO4vRr0vIaNnVKu3z4wkTJBKw2jag74tM+JvyzvyroyMpjnol+Rqjmdn/OC7JNfdtQmWjO4/Rj2Sjmsa1WrQYwkFOkZVjPoOed1H/D15VR41mvbZ+bWM62POzPiB95jcKPCq1T/i2BjJQIIbStto4qB3JRQYGFX95q6eURWDvsmH+0aOszM+6K/JzQLPG1H9xzyVMEFsdN+D3jeilXsx3A13c4JzMz7oB+VWgZ1W44gyZ+ZZqdHEK9tDAX4Kov/YOwsgV5LkDPvB7JvlPlze1THfaZl3+zH7tMy7OuY7LfNum9kysy0z2zKzLTPbMrMtM9t9sO+95b78LzojOipaPepUdalqlBXxxYxwRtSfMisraz1LvVMQ+L0GvgsRUu8S95Vwlb66OkIfFdE5oyuyyrcm1Ohcx1IKfQtxYy7w+wpcGkgB0xZiH3F/zkeIS/WV1aFC1+K44xj7kbmObZ/zREx0iYToE6MKhkSSExPNLl9TsZ8JiRPnEZrKszn0vXUU8SZiW85WojX/PWvKnXCyCkuHyruVy3tAjInMEiOWvD7LOpZ4RcgtRC/nIPESj2W+n7iFuDnnJuJG4sKZ7kSL4qIpNL4LnA6VeI8F7oCUGBKdgNLDZwBtJalDeIC/mLiTKUj9fZC6h0J/HXE7cRtxa84tBbG/rPoedCCtTpxgROaNyVyHirxLjIhsgaREn2h5KvNLCuuj78nZWvNudOjB/YPEXQYs94O2/s5533tNTCR1mCL0PcQdudSZ2wpi36Gvaq1oXefMGxkq8YhIiAmRecagKbG/9YGrIyLOadWQ+T0G9wLfC7jyx5nkdIn1vOsUv77dwmOOPTqgn0HcQ9xtcBdjUegJkdVhitD3Em8jujl3GGLfGfB7pUXEQI0Q8lCZ94iUyDxnQEQWP8BtYkJkBbozCP1DLHCD+4gPeyy2EZEZTIj2OpV5zK+vQc8noTNlche8xkMisS10Fh4Jex/x9py3AUPsWwN9r/SJrMA4xC+7OrRKnSPyUEiJnqUP8ZjISkgqZP5SQ+Am9+M6nh2sOkRKZFNIBVFJaAdok4EHQt9C3MuUyP0G4ZeXpoSevPOzb/jtf/79ez9M4n4HMOTeDaHXgfmlvuI4MFJL6AglvT4ksoAZzZuGX+OAPySiEqGfaAq8hC0eReVDIpuR3jqJysczPt4REXmwM+F9OfcanDHja2x+eWlM6ER2W3LdP//8T33wM0je78xhsV8e0nuFH08Vagvfh8q8Y6TXQyYlOtaFXp2OhtRvKpH4Azk3e3Kw6lVH5dVfZAKdKx8IHm9KxB5I/SMFsXdnlHmXX2OXQgfXPHzNoS/4+u735kvYdhKvCn8qRoUe1lCZ94lsHdKXPB81BJAQkZF270HgBncSJ/kYoQok1wks0mKxSekTUUBCMushnAndYES0Aip6G9Z5T6g1fB2aYh8R2TpmSESCqG5W+U2KBXMQN3EN8WAOfj/Jm4O8gNAO1ng9ONKyREp0fRaS8Rp7IHTjS6+nz5sgezNQc/g4VOZtbgyzBIyJqMFInSUX+1TwJhD5qKYIB0TLo9R6TyDyEZFJvrwFEJH7IHSQ8lLIgEWeEp0lb+27Uc3pr8xTRyIdEkkFA2Lk4P9J5phzzuoe9IkoIKmlRCIsmANDIl5gNfKASAWvU2zOOde4bbLA17grnD7pOBN6xfuMaC0qcyPMVg2IaMllvkIsWbMblfmY+69b6Atv838cWJCGRJIDouPoAD+0mT7nLzICSfaJtoMIqyetCWAZ11imVIXL13ggfLxjfk3sC138Xhm6+OKL10bwhc/40qeDZL6qQl8OmU+IHtFqqPJ+4ELmdZcBCeQ+JHpE21ZXtznnxidlIrIkOb7/AdElWhYE3iH6xKTJuX+ONiXYeo3xXrP0GqdEz0WnOOHqCWZkqVsffzZ6xFD8/3DGyhi6/bJvQtcCuInl9d4dh5vBDCQy97RaHIxy4SVEj4hL6BAJEMxvyw5W9g/WTGo8ZhCXwJcNiJGFv8sRalwzIzOy9HeHRktd4/W1/3jNLIQDoYuqxSuYsOQr3is947NR4zMpqAtRoW/0S+gq9LHFiLy7wF3ehgKZe19J7YB0nnlf3E6+DMw+LorYINwAXmOhkORClxTrBYCKXEcYg6NbC/SJKIAmOHKZByx2BwVcHIX1PRf7iIiX6DWuLjZzLHRT7CpyHSGmJDYRxxIR8QLiBGKzB/LrWuq8Fgeyhn4QQgWtA4ZNFmtxxO6R6FI+OLtYCugJY2lhmQOhm2IfePYlt1f1vOlQmUcFmb+YeClxErGyQOm1iNT9Gm63Xe4cyFwSwU4WdIDvyaVmv5LYAUOi6/o1XuCXGV5J0PJl+1TBskpb892NrMDQoUI/vkTmpxCn4fcFym7kqsuaB1mIgac7NvXkUZ39SnJHcu83eNAe5/ffCf01FqyQMF/joIRufily8LyNLKw6MPdr2ExExKqab52OCpmfQZwVaKpdWxw2c/DvcmVuTjpLxS8wKn5bgWyMwhXJ/cLjyGo+5h4Rh5AiNSqwRzUqsCfGKoCO4DX2U+jy5y2d8QveqLCaoGMK3KLMX0PsILYRW4k2oZXf67CcHzJ/US7zk4syJ162iPnlOVPtut+vH1s2JvqY9fEGKXT7sl/knuSQ+euI3cROQ+rn6dFr/Un9hQWZn1qUOX4uQOjJupgzV6EPVOhOOmC1clZV6Cr0EpkfTewl9kyR+snr65OpQj+mIPPTCzJ/BXFsQIVwKaFFI+6Lq0YzdNHqrLOph4RIKyq32w4+t23ifuLxArsbnGcfV/T+b6vQS6dsOsSwYsOXtgOhv4jYXyF1Xfa23gbEnQv9TKKVc3xge5s7koYOYRvZSchVutyoxYMWnPi8vhYCn0Ic/uMNV+i8G5qkaVKDQj9QIXWX06o6XKfwAH4PbO58qK+emzFne8w0RKnPuQ550MDn9D0VQr/fUl+CeSr5oyUUOmczUt+et1zkkPq+EqkfrUc1HU0IvSdPteu8uXw4O9AzowAj80yO/blmlncFJ1uZ85WTLJvQIWMLvQyGDQn9ZOJgidRPber50KFCn8j3Cnc/NDqXs4SPeexY6KsLykYw6RIKvUdkFmg1JPVjiFcTFxOvI17Y5GujQ7dG9Tw612GrkYbNXuXf8Zc/2iJuJLo5Vtv82uogZ1noN1TI/CM+vMZLKPS+08+GDh0+t0DV6FyFLpB5m0hK6Fh8zJmHQj+5pMKdaanQp+PnZ0OFrkPT7Rqdq9AfIJIptEITuqDDY4d4IBf5DRC9zdf4wMMPZ3sf+/ps7+Pfke38zN83yfY8/kO4DNcrPFYV+n0f2J99RXdn9t03b8t+rXMZyP5i78XZf207P5vsvJDPy4bXx9k33bYD119eoevQdLv79q466GDU/p6btk5wAJoHHOi+5O27OpZS7UkFcx8Yn/q5lfZ3fv0bs/H3nzw3dF99ouX5ZzHa+9g3j3d9xq+Ilo7idvse7S+l0L/mjp3jn73mCggb4hZBt4foNeuoI/zqdq/XnavM+0RmmcRnoecCzhqg6+FnsEUMxMtGDbZ/9n/jZ0JExt+JBW2cfRU6PhctIiFSIrNISiREcBlIHSr0oSTdrs+cM5kPiKwhOg2m3F87h8w7RNYgLc9EnjXEhIjXm9AhWqnIBWLXwEVHWPPn3qbbVeZdImuQcUNFcd05o/NJw0IfeJIZS4nMAf2QhW58JmJiQmQOGYYQretQmUdEJsBB2lKHowNXa06pv5bo5iJ/L6faPY7OwWTBn7kRkTlmELrQeeppQaSEv10WdegQfMCZ5t/YKvOIyBzgU0oRQk+IzAHRggpQUyJbEOMAhc6fhZEreYeagtehQu9KDgz6zDkRekxkDkiWVOjxMsmcCUzoLPMxkXmEZihLxse+4os2EVuIo4iN+oyEsff5WJ+5BocKfRiM0AUyV6EHLnOmmH5XkW8gjiMig6P02fFf6KMApwicEaDQh54JfeRI6B3PZa5CF6TZ3c+p6zBlbrCiz5CjISzO6avQK2lZEnqHyBwwWVKh9/zdkliFzgVwnjMmoiWX+UYiquA4Na3fQk9U6JXEAaw/N+l6JPTUkdD7zj9fFrjiS5/4pYu/9tDXXvnFT/weTm/9/Cf+LVihO8hO/ff2C/+D+b99274V5+Hn/+2Nf+C/d1z8txb+Rn/Jhb6ZiKpQ04YsdBV6x1IHLNfpw8gDmXeJzBETInIwnSVm6+c+8fHLvuyJH33dzxy+DhLHeW/+4cNvX33qqTcXT5/8N09eev63HnoEcg9d6Hgf2liu+b+7r/jpj197dS/74AMxBP4/Oy8Z4zQuw3nMkdu6N35K9Nsv+MQcfy9WoU/leDVtyEJXoScWlquNly19iL7tDqNzZtBgB7hsHiBsiBryBqbQL/3KQ99ZPM2c892HPgKxByz0hMikQNyQNAt7LaEzT7/j/QfwJUD62VnyKP2ECqGvqmmXWegq9PEyrbN9+udXIl6qtiDG9D+0fUm1x1/4xF8hImdBm0K/8BsPfQFOc8q97Lr4IoDUfGBC5y+z4nau/39g51exoKuEDnnzZSa4D13KJorSTyyLzokNatqgi+JU6IE3zwB9h1H52KXASd7TSBb9HoXMOSo3QSTOkXtR6Ph9GkjXhyN0eXSOdHn66Xs/35QzzkPUjflzXA9z5vwTc+ickjfBbUTFpboG/RjiuJwtathlXLamQuc58/ESVfDyfHnqXN7VDIloEdG5IXMrQmephyJ0aXRuyvyJG298J0v8f3Zd9mv4HRJHpM5peZY75G1G7DjNt9coXYc2llGh15F5mw9kHjIh2k3I3IG8pYyJyOXcOea8Wea2hQ7wZcF3oUOGNtLskDEidgib59KLETzOh8Tx+8euOvgILsNps0gOQg9gLh17KWwhTgBqNPdDW7+q0IUyD7+BBsvcjbzdSx3TUZL3DBe2NSX0l//mkT0BCH0oKYArS5dDxhx1Q+S4LkTNc+SQOC5nqfMXA9w2oA5ykPnLiUuJi4kLiXOIEJeJ6fjB33lqM7ES4OYsKnSjACgAJkTkXuYyIbuXunwrYqTEId1ZhQ6R1xU6F9X5KXT5RkRlc+CQdTFqh9whajOCRxSO31n4Fhk4kvkriMsNoV9AnEccHY7JVOTHE5cRu4k9REyc5Hj71J4KfSodydK0ABhbKIBzKm4LDGq2eM3qgujZhdCR0vdY6B0b0TnAZYi6OVqHvM1lbCiI42K6AHs6QOarxJWG0C8qCP3l4RhNZX4lsbMg9L3EfuJFfL2GowowXOBe0rFjsprELtta4qAEuAMWz//xQc/yQas/x9K0iTV5j1b+4elfWHkCvz/7t5seAjgPp5/5tc2/xZdZoiuuR7EQnZtCx/pzidC5QM4vocur21na01LuAO99FMgVq97xmQi9xzvS6msI/ZwwjKZCfx2xY4rQrxBKciiQVqr7xU+l7aKtJQ5cfFDjgxRHInwav/M8oaX5QRALhN6fW6y/tPJfz/zh5m98/hMbbsyyTzv49K+s/CnOx++AJc6nIflnfmPzL1gQekq0mqhuRxOYuilzrC+H3FHoNuv8O4O/56PQJcs1y2ReFDfS7vg8CIrcpEyILkfnCxb6m9WWYQj97AqhHxRKq2cvtaxFgzNE55MmOmHxnGKZ0BncDpc5nE+HzON5hApRQ+QsasYUOn7Heeb1nvvnjR/m687BcIb3Slq3retahWyIxmft+gbBm93lyvBU6Kkk3V4FPgtYsuZgKmpAxI4r2zdD5FPm0M8lzlJbhiP07VOEvsdxm8qBD8/JM3/z8CpxZs6JloU+ILIaTGSNMwTNMwRCL0Ywc6bikxpCH82TWn/uvza+A2KeJnRcXiV05pnf2/zdc0q98qBd9/PDc+FloBuceV18AShuzsKix09cXvyiUBW147oeCj2rA97v09q3IjJ3FI0nhJG5cSr1k6YIvU0Esg+5Cv1ludB3ELsKQt9HcKrX1Tw6iBYs88uIBws8ROw0r+fweRk2UdVuzAWuKfRZ0pK4P5Z6Q4U/kHlHKlCky5Fenyro3978ozyHPovQwbN/sunL5hD6yObUDC8/M0FUXtbPnVPsfJrT5zynjvOLt8VmLdX374XQeemmWOj8XuYCuIZFPqpsjexe6i8i3pgLvU28jNAObYEtVbuwROiXiZewydfPgmSBMn81i1wsdfuZi6RC6D3rMjeEzgc6bm+J3xuUeq+p6ByReZWYOeKuEHpTUo/tCL1cuIisOcpGj3ZzHTmkblatI0LHaQb3y/eB2wmWr7kWeixdruawyK3fZDSuQ6V+JnEecQHREstcvuSGSYloQUJ/O/HAFKGDVb6uw9qCWDR3LqjmNVPoptBnmWcsNtYQMFlD5m1p8Rsi8zpCxzx5hdBtpt8HtoRelhaHnPmyMglzNM4g/V51fbOKnoUfutAxN+4gGh9rK1cdIReAjUOK0iHzNYR+luvng29rI60IsF52FilD5CKhG+tyBcS2K9s54q4jdFBH6ICXuQmImhA6InJzbp0jcRa9GXFDztNuw3Pu+N3MAgQldPcMiLYaQceyVXQzKdFagNDfZwrdkPqJjperjWyuO+f2lC6Ezt2zLK5Lh9AnknlzyNaF0Pk2AjpNCJ2jakjanPOuWrPOsjeWwFXul65CLy1y67lYcqZDh8umLam457N7oe+viNI/sIAds3o20+0sZxdCL95HTSY20+2oWHcldIAmNLK0u/05dBY6C7h6Prx63t28v2Dm0N0z5CyTDh26+5opNPfL1e6cIvQzF9BetlWxNWpWF47OpULH0h38XidKFx4UWyVC79UWJctYIHTMuUvuQxilT5qocufIGfPikDeL15SyiSl+/I7bc1U8fvdc6G3HEk/XXnKmQ4dG6SnRXoDU9xNvJ95PXEOc1MjcuTzd3pEU/cxSoQ6BFwuEeNvIYgMOLOdB0dwsXxCEjTg6JUIf1BUlqs/XFPBfbPociBzi5s5wKKLj+XCWOpa04bqzSB23l8+jy/dEgLhZsmaRW+Wa8gqp87w5g7R7KOvQHTDSIjcdGqXXY0JES/jYuzabyUDAVSKXLNXhHaZmqZavSWJjuRqi7MpIWiBeSH8tsQvbw8ZNdYpDpI4oGoLmgrZZwfVxO9ye0+8mLP1QO8UJovGBRuPLPjRKn8wh9TERhdq33XZf+/yAktWAe7JXdnhDSh2ncV38XkzTIyrnJW8cyeN2HLVPi9ZxX5J5yBKhp7bWnfO6cY6+cRpz7Rydm1XrvIytKGr8bnldetdG3QVL1xUh93KX91XXoUOl3iGyJZE6r8NP7S7bkx+s1moCw/s9s4RZ1Obacl72xtfjdDzvD12GJJVpPmZb8+eIrjnShniL55uiRr93nIefxT7unJpHqt7iPHpic7c1N4S/25q8r7oOHSr1oQOphy7zlIhsCb2qwxuEbcoc4LR5vlkYZy5P425bFX/HqdAh26r5bQi8LE1elDxH7Wa0z1KfVkWPVL8locf290O3B69ND2A/dFFfdY3GBUOHFsgJpN72PBOR2q/slwsdQi2LzqddBmmbaXpOu5fNx0PkXHhnWegs85YNoUPWZhTOAoagAc+7l6XdzYr4qtS7DaHzPLqvUTpXt/sgdIuFcc6Wy+ILA1hmJ+jQ1DtIiU4IBXCSndVcCB1z4DwnbkbnppxNcUP45py5Oec+p9DHhtBjG0LnNeKIsMs2Zan6EmCm8CF+nnNvWOgDIpM2mWkK7gXvudCHQqm3HQm9T0w0pa8j6MEbt1hgSEQePJ6WUcAkJXYldJxnRuE8p87nVy1DM+fMudUrpO9ryt3c79ycU4ekq1q68ly6eX/NCV2+JwK6vXFFexNgTXoAQpem3ccOZN41OyRqtB7+4I3lV4mVJZO6DQGClOgtOCpPLTwObnlqXeg8710lYLNArqpZDO7PlDqkPS1Cx/VdCx2p8Kr9zlnmEHnZnHrpnLkhdUTnOL/0+nKhW/usQLqQugeFcO6FLu+oyAwalHm7bFmdRuthi3wTcQIRMfnpTUs0nz4mMktMiK7jPvUTIrNAdUTQQJU7p88hcci4TntYyJ8ljZ9c6Y778bnKHdI2G8eYhXCzSB235eI6pOvL/45VocdE5oPUWeYBCb1HZEK6rmSu0XrYMt9AnEhEJeD8Dbo+XUxK9Il2Q9XrfXlELqtqt7ExCwReJnVIGCCVjtN12rpC/nx7/I7zyv6GhQ1aIPRxXUlOW7YG2QPMqRvz6ZUgskfkz7dHWt/iVqpxUxktpN+xPn3einbuOheY0CNxlM7vRcEQfLnQaD1goW8hogq22P+rAS/xkjPJBdwhIuHceIfoy754yFvb2o46OPJ2DdL3ljrFDaXbpjpFvo1qa4bPSTYPiK7NaF3QAjYcoZvz1XJGRGsOkbcEWTWN1gMS+uoaQj9uyebTW9L0u0CgI2JAJFMYAcGXDAcyl+8mxWvRXYO/a2NPdKSkpfPoLuG16zVJ5asoZGLnrVGrqtgv/MZDX8BbqYJQhc7TVI73Nef0+sDG31Vrhi30Y8zb6Jx6+MhlbmeNLea+Xcqc17rXxXiooqVrZuW6E+Tp9qG1jX4Ec+zYXKWIIBoPQegti/3dJ7moE6JDxDmd/LwhMbHYO76t1vS/sj2q4KglbjwzUJk3E3FwVbor8PdsNvaA/KTL11zADWoE/2evZjYrJTI3hC90M/UeGF01ZhhSP0ajc0FqMWzGRMt+gY28OM4+4mI4plch9KHPUTo3qBHQktedqNAlBaWB0FdThiX1o4jjmKWMzKuX6kxClXfDTXA4hZhJ5tJRje7p3DloVQi9KxEmqtkblbl8QxYwdlRMqkI3dit0j86b69De7/0gBe6g8Q23tvQt9Y77t9tHW76NKuCGMB6m2kHXwgoRFXpQUleZ69BofRRiNCJPscuq3eXL2BwsUxNUt9uodjcbyNiWuXCZGkgtLfucLDLzFJLQA0i/9wI9TOvQIe/O5oQAutZxcZz7SF0emQujcxZ6xFH6QiN1XqImlzlIpkzFxcRHiMdz3kqsVmWyWKyOGRBxgEI3C+VSD0SeEovccErHJ9m7q+XGtTSK45/Txthp72ZmZmZymrndzIzDzcMzuh5qeAE/wEAeoW+Hcz3oR3Cdu8FzznLVTtUulazYsixZ0vpX/YYxHWdFsiwxDrv3IQ/3KN18cIvxIBZPmv9+8/ax3R+d+3+Ubn9PvdsL5ZpH+15Ps2t1UGJLj/ePHXwL8uO8Lp4HeAr+nqCoD7r9xi8h0TeuYYyn4kf64dS6hyEP9710E+7nbt66tdPbv4491KULI9Jm3m8Fa4Mxbn6krbNh1xe/6Ye8dKnqMOYzjQH/kYMdfXDdyShsFBSTQbcfrdcDHPK6+1E5+9Xv/p2GIpSgCBlhibh47l7A4z4Kz833yEMcdOXLaUMMc/O0efMZ6fZxN0e8+c83/3XdDrnWAOVh0Dd2O6rmHeWaR9zNU+itRrz5kbSxB7L4YKTFqfYD8CMXdzv8vPo7aPTi7FMMBj3MYa/z8+VtjXkWlIOCsEh/vK8Iu+AInIZhmOky7lXjNq5+HoW/g3vhj7ivz352fexq81T6GOMxqH6qir1ATr27H717f2/cy6l2/wfdTL8eah7GvQE1qIougEFfCJVO9Pg1VfPpPfYG1KAi7cZBL4NqIS0ssmN+CW7ATbgFt+EOzOvgaKUCz233bLergaU9h4oe70ikbzv5RYRY0mUYxxp8EREN2Ojyvb5inEE/5tNV8VWw4F2L7/979rsZ+jjoNYlg+r7sFoxAO9eLjMIIWBxxz6falYu8sEgO+l64BtcdRv2aMPfP18b8s7b6qvfRiAx6pY3v97stxvwtqD58u+t5h4Nuxez1pqCiKXGNcdA56JfhClxtMewzJGpx1M0xT8qo3+vgwU1n4YeGb8CMmNym+bmwdr4PJjUleNBToFxkhEXyG/uS+6hz0N1HPdZjbh/1kUicZm9/2Bf0+/e3h+tUKsJapv/Mh+EwHIL9sDCho14A5aAkLJrpb+qLLsOeFeb+AJcE3QXLfqFcyEZhY5D3Zwhh0L/oUOtx4s+62XDEGPNhqOhRX5DQUc/DRFBQhjykhLXus48/TUEJpsEsmAET++SbfBachwsOw75JWDsX89RDHvI6BDZs+tnp9ZDH/B2oAAZ1IVjGFezVIH+B6PSqeRkvXi90CA5CBQ7oMd8LO4S1GQd9CCbBVJgOM2E2TOqTb/T5cNo26u0PBEddhXgFvAVKAk6fgn8X0lF5JcSbKtX7+HT7iLCW2Y7KD8A+Pea7YWc7j9ZmHPMsKG0STIFpxqjn+uSbPQNTNX5je7/FZVDvrddgoYQcxnVhQB9tq8O9AG6g9BzqYV945v5xNS//u5jDUfke2KXHfDvkZJwYB70AymYyTIUZUJI4xmG3enAqvg6Wy5CHPexWD07F16DS4/Hc6OHGMBvDPTr38P45B30D7IM9xlH5DtgG64S1EQd9EJSdcbReFBb399jfdfFwilF4BxslIunbxlrwCRoeTqnXoApKAsjj7VvroEL+qJppVFg7N9HaDbv0kG+HrbAZSsLaiIOeA+UiI0mKA1+BKljwDiytBpZWjdPdr/TRewWqYNk8hwpsDPGjYbUunjegwr0QzsPpdo76KtgGW2AZFISxDq5wHwLlYEhYXH5pWwZ7YC3kJCIxfSW794esNGBjCHeFMzVACWMskB/4A1ACZRiElEQ6pj+18ARewxvtm7BWQo0FcJrbZIHy/gtFVw86soQxFsrReppDHqs/08fwCl47KEuU4iOC612OegMsWNjhU9q+0EI6OmeMMY75UngJrxy8ht0SpTjqFZ+f518Dy+ad+9F4GEfnjDHGQd8JL7SXNq/gSsxuEzkfHsB3tVOQ56n30IxKj/v17/89s0kYYyzmg74anhte2ByL0Zgvg+84uA+5mI16LQJj3oCNPRzypXAD7sIduAZLhDHGYnx1+zP4Fjx3MDdGg/4Mvt3C3hiefh/t80Gv9vio/I7hNtyCmzBXGGMspqO+Cr6pfctwNEZjPh3eurge04vk+nXU7/X4NHtlbMSNIb8B1+GMMMZYjEd9DhyGC3AKVgmK2aC/cXEtxle+15I05nrQj5gjrl2Dq3BFvMYYY//96/czsBz2wWZYLCzoUX8Cr1vYzc+o91wDKhJAGO1D9hHXLsM58RhjjGNehJNwRbsK1+CgsKCP0r8Or2zuQC4hH2mrhzTmn4J88ApGe61txC/BRa27s0/8eTYB0jAgSYsxfVR+UbsEl41xXyNBxlGfBmfhJXwNKpBL4B3lGgENeR2qEkIY7gPGiF+A87AXMuI1DvlEUIYSpCQhMb4IBqGqnYcLtnE/IoyF8956L4d9FO5JyGG8F8BKbZYwrz/HBqAMykFJEhLjC2EKnIGzcA7AGHeQcGMc93swAg0fRvwdbBQWt59jBVAuJkhCYnwhnIRTcNph3IeFMX/vKzAHZkPO4/vsz+EdfNLMoW8Y/3gNLKiCEhbb9Kl15SInCYnxxbAdjsMJh3GfJ4z5M+Zb4QE8M2wVxno/6FlJQozpK0J3wVE4Zoz7emHMnzFfB08dPIEt0l2MP8NyoFwMSMJifFHMhsWwBCYLY/4N+nV4bHhkuCPdxfizKwVDoBzkhTHGmG+D/tDBA8Nk6T7GUc8bH10b4ql2xhjzOT3a923uGbIS1Rhj7LMPP01BDopaDlLCWPwGfRjuandsTkvEY4xxzIdA2Qxx1FkMB30yXIXbcMtwBSZJhGOMcdAHQbUwKIzFb9QnwX64pO3jmDPG4jDoZVCtSD/EB6XshWFtkTDGGGP29HBz0PtzzGfDJcNlbZswxhhjHRyhlyXMOOin4bx2wWa2JDHG+JG4QSiDgjLkRcc46HlQLRQkrDjmU+Csds6mCpslUTHGXG5aMyisq1uUFqEMJShAKsJXuZdA2ZR4lXvog37KcNpwBtZIkmKMu5P1/0lu/KJmQDkYglSEj9QzkNcy0g9x1A/BcZsT2hxhLF6fPkhBAYagDEVICxvbniIozadby/KLWuYXlAU06IvhsOGItjVGr6e5sEVbCBlJahzzIVAOsqLjk9z8HnSealcuSuJvjKM+E7bCMOyCRZCOyWtpNxyz2QVpYe18/SbDDJgCuYgPegFUC2VIifBJbjzl3o+DzhhfS6vhUAurhI136nUezIU5MEubGOFBL4FykRbhFe4w0b/t4Rd0AJSLojDWTnwtHXAjbvGH+gxtOkyDqTAFJkOagx77DSrZr3DvwfVbvDCh7RcTY3wd7XGxW1rFr1teD/ckTdkUIjroRVAuBsQef7FL+zPk/ELaR73c0fNuGePraCvsMGw3iVsc9Ni97YfBToNqoSiMBXDqI83fkiLzUcMSKCjxatC+ubp9s80mba4wr59FLkT4ffQslO1jDilhjDF90x/eWan//lwmwGJYZ7P4y/buwjaCIAiA4BwzmPJP1WOZmblK6ggeDpaenq3rDeEzS2fLP7CErb6oDOCFTGJs41txMaHn5KIlXsrN0Ob7DBhv9JTO33hSby++411WBsA/vqBPAQD8+glEXQCc78pYZVO2Z1s2ZmUAP/64wc3qBODGxXzL9jttWRXAj91ZaTWTGrhxQV+z/ZHmAH7czOD6rAC4vpjX2f5UAQC4oAMAn39BL565oK/xKwCAi/rwxAW9j18NAFzUh/h1AMBFvczqi8oAAIC3nlBUZv1FTfwmAAAAAAAAAJwCFTYKIsAqRp4AAAAASUVORK5CYII="
					alt={ '' }
				/>
			</>
		);

		const blockprops = useBlockProps( {
			onReplace: uploadExternal,
			onSelectImage: updateImage,
			...props,
		} );

		// Render the block editor and display the query post loop.
		return (
			<>
				<InspectorControls>
					<PanelBody>
						<p>text</p>
					</PanelBody>
				</InspectorControls>
				<BlockEdit { ...blockprops }>
					<IMGSVG />
				</BlockEdit>
			</>
		);
	};
}, 'withInspectorControl' );

export const svgImgSave = createHigherOrderComponent( ( SaveProps ) => {
	return ( props ) => {
		const { attributes, addSaveProps } = props;

		if ( attributes.className !== 'oh-my-imgsvg' ) {
			return <SaveProps { ...props } />;
		}

		console.log( props );

		return <SaveProps { ...props } />;
	};
}, 'addSaveProps' );
